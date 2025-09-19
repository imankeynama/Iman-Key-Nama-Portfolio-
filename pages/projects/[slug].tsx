import client from '../../lib/contentful';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS } from '@contentful/rich-text-types';
import type { Entry, EntryFieldTypes } from 'contentful';

// Define the shape of your Contentful content type
interface ProjectSkeleton {
    contentTypeId: 'project';
    fields: {
        title: EntryFieldTypes.Text;
        slug: EntryFieldTypes.Text;
        body: EntryFieldTypes.RichText;
        featuredImage?: EntryFieldTypes.AssetLink;
    };
}

export const getStaticPaths: GetStaticPaths = async () => {
    const projectsResponse = await client.getEntries<ProjectSkeleton>({
        content_type: 'project',
        select: ['fields.slug'],
    });

    const paths = projectsResponse.items.map((project) => ({
        params: { slug: project.fields.slug },
    }));

    return {
        paths,
        fallback: true,
    };
};

export const getStaticProps: GetStaticProps = async ({ params = {} }) => {
    const projectResponse = await client.withoutUnresolvableLinks.getEntries<ProjectSkeleton>({
        content_type: 'project',
        'fields.slug': params.slug as string,
        limit: 1,
    });

    const project = projectResponse.items[0];

    if (!project) {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            project,
        },
        revalidate: 60,
    };
};

interface ProjectPageProps {
    project: Entry<ProjectSkeleton, 'WITHOUT_UNRESOLVABLE_LINKS'>;
}

export default function ProjectPage({ project }: ProjectPageProps) {
    const router = useRouter();

    if (router.isFallback) {
        return <div>Loading...</div>;
    }

    const { title, featuredImage, body } = project.fields;

    const renderOptions = {
        renderNode: {
            [BLOCKS.EMBEDDED_ASSET]: (node) => {
                if (!node.data?.target?.fields?.file?.url) {
                    return null;
                }
                const { url } = node.data.target.fields.file;
                const { title: imgTitle } = node.data.target.fields;
                return (
                    <img
                        src={`https:${url}`}
                        alt={imgTitle}
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
                <div className="prose lg:prose-xl text-slate-700">
                    {documentToReactComponents(body, renderOptions)}
                </div>
            </article>
        </main>
    );
}