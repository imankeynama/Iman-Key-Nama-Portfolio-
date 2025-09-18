import client from '../../lib/contentful';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import type { Entry } from 'contentful';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS } from '@contentful/rich-text-types';
import type { Document } from '@contentful/rich-text-types';

// Define the skeleton for an Experience entry with a body
interface IExperienceEntry extends Entry {
    fields: {
        title: string;
        slug: string;
        body: Document; // The rich text field for details
    };
}

export const getStaticPaths: GetStaticPaths = async () => {
    const experienceResponse = await client.getEntries({
        content_type: 'experience',
        select: ['fields.slug'],
    });

    const paths = experienceResponse.items.map((item: any) => ({
        params: { slug: item.fields.slug },
    }));

    return {
        paths,
        fallback: true,
    };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const experienceResponse = await client.getEntries({
        content_type: 'experience',
        'fields.slug': params.slug as string,
        limit: 1,
    });

    const experience = experienceResponse.items[0];

    if (!experience) {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            experience: experience as IExperienceEntry,
        },
        revalidate: 60,
    };
};

interface ExperiencePageProps {
    experience: IExperienceEntry;
}

export default function ExperiencePage({ experience }: ExperiencePageProps) {
    const router = useRouter();

    if (router.isFallback) {
        return <div>Loading...</div>;
    }

    const renderOptions = {
        renderNode: {
            [BLOCKS.EMBEDDED_ASSET]: (node: any) => {
                if (!node.data?.target?.fields?.file) {
                    return null;
                }
                const { file } = node.data.target.fields;
                return (
                    <img src={`https:${file.url}`} alt={file.fileName} className="my-4 max-w-full h-auto rounded-lg" />
                );
            },
        },
    };

    return (
        <main className="py-12">
            <article className="prose lg:prose-xl mx-auto">
                <h1 className="text-slate-900">{experience.fields.title}</h1>
                <div className="text-slate-700">{documentToReactComponents(experience.fields.body, renderOptions)}</div>
            </article>
        </main>
    );
}