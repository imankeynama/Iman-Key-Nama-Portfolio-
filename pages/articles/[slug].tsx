import client from '../../lib/contentful';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS } from '@contentful/rich-text-types';
import type { Document } from '@contentful/rich-text-types';
import type { Entry, Asset } from 'contentful';

// This is a more flexible type for the entry
interface IArticleEntry extends Entry {
  fields: {
    title: string;
    slug: string;
    body: Document;
    featuredImage?: Asset;
    tags?: string[];
  };
}

export const getStaticPaths: GetStaticPaths = async () => {
  const articlesResponse = await client.getEntries({
    content_type: 'article',
  });

  const paths = articlesResponse.items.map((article: any) => ({
    params: { slug: article.fields.slug },
  }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // Use the client chain modifier to ensure links are resolved
  const articleResponse = await client.withoutUnresolvableLinks.getEntries({
    content_type: 'article',
    'fields.slug': params.slug as string,
    limit: 1,
  });

  const article = articleResponse.items[0];

  if (!article) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      article,
    },
    revalidate: 60,
  };
};

// This correctly types the props passed to the component
interface ArticlePageProps {
  article: IArticleEntry;
}

// This is the component that will render your article
export default function ArticlePage({ article }: ArticlePageProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  const { title, featuredImage, tags, body } = article.fields;

  // Custom renderer for rich text images
  const renderOptions = {
    renderNode: {
      [BLOCKS.EMBEDDED_ASSET]: (node: any) => {
        if (!node.data?.target?.fields?.file?.url) {
          return null;
        }
        const { url } = node.data.target.fields.file;
        const { title } = node.data.target.fields;
        return (
          <img
            src={`https:${url}`}
            alt={title}
            className="my-6 rounded-lg shadow-md w-full"
          />
        );
      },
    },
  };

  return (
    <main className="container mx-auto px-4 py-12">
      <article className="max-w-3xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">{title}</h1>

        {tags && tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {tags.map((tag) => (
              <span key={tag} className="bg-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {featuredImage?.fields?.file?.url && (
          <img
            src={`https:${featuredImage.fields.file.url}`}
            alt={title}
            className="w-full md:w-1/2 mx-auto h-auto rounded-xl shadow-lg mb-8"
          />
        )}

        <div className="prose lg:prose-xl text-slate-700">
          {documentToReactComponents(body, renderOptions)}
        </div>
      </article>
    </main>
  );
}