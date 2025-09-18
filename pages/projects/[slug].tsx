import client from '../../lib/contentful';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import type { Entry } from 'contentful';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS } from '@contentful/rich-text-types';
import type { Document } from '@contentful/rich-text-types';

// This is a more flexible type for the entry
interface IProjectEntry extends Entry {
    fields: {
        title: string;
        slug: string;
        description: Document; // Note: This field is now 'description'
        gallery?: any;
    };
}

export const getStaticPaths: GetStaticPaths = async () => {
    const projectsResponse = await client.getEntries({
        content_type: 'project', // Note: content type is now 'project'
    });

    const paths = projectsResponse.items.map((project: any) => ({
        params: { slug: project.fields.slug },
    }));

    return {
        paths,
        fallback: true,
    };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const projectResponse = await client.getEntries({
        content_type: 'project', // Note: content type is now 'project'
        'fields.slug': params.slug as string,
    });

    const project = projectResponse.items[0];

    if (!project) {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            project: project as IProjectEntry,
        },
        revalidate: 60,
    };
};

// This correctly types the props passed to the component
interface ProjectPageProps {
    project: IProjectEntry;
}

// This is the component that will render your project
export default function ProjectPage({ project }: ProjectPageProps) {
    const router = useRouter();

    if (router.isFallback) {
        return <div>Loading...</div>;
    }

    // Custom renderer for rich text images
    const renderOptions = {
        renderNode: {
            [BLOCKS.EMBEDDED_ASSET]: (node: any) => {
                if (!node.data?.target?.fields?.file?.url) {
                    return null;
                }
                const { file, title } = node.data.target.fields;
                return (
                    <img
                        src={`https:${file.url}`}
                        alt={title}
                        className="my-8 rounded-lg shadow-lg w-full md:w-3/4 mx-auto" // Control size and spacing
                    />
                );
            },
        },
    };

    return (
        <main className="py-12">
            <article className="prose lg:prose-xl mx-auto">
                <h1 className="text-slate-900">{project.fields.title}</h1>
                <div className="text-slate-700">{documentToReactComponents(project.fields.description, renderOptions)}</div>
            </article>
        </main>
    );
}