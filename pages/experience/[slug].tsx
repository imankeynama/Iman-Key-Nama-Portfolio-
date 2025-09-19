import client from '../../lib/contentful';
import type { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS } from '@contentful/rich-text-types';
import type { Entry, EntryFieldTypes } from 'contentful';

// Define the shape of your Contentful content type
interface ExperienceSkeleton {
    contentTypeId: 'experience';
    fields: {
        title: EntryFieldTypes.Text;
        slug: EntryFieldTypes.Text;
        body: EntryFieldTypes.RichText;
        featuredImage?: EntryFieldTypes.AssetLink;
    };
}

export const getStaticPaths: GetStaticPaths = async () => {
    const experiencesResponse = await client.getEntries<ExperienceSkeleton>({
        content_type: 'experience',
        select: ['fields.slug'],
    });

    const paths = experiencesResponse.items.map((experience) => ({
        params: { slug: experience.fields.slug },
    }));

    return {
        paths,
        fallback: true,
    };
};

export const getStaticProps: GetStaticProps = async ({ params = {} }) => {
    const experienceResponse = await client.withoutUnresolvableLinks.getEntries<ExperienceSkeleton>({
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
            experience,
        },
        revalidate: 60,
    };
};

interface ExperiencePageProps {
    experience: Entry<ExperienceSkeleton, 'WITHOUT_UNRESOLVABLE_LINKS'>;
}

export default function ExperiencePage({ experience }: ExperiencePageProps) {
    const router = useRouter();

    if (router.isFallback) {
        return <div>Loading...</div>;
    }

    const { title, featuredImage, body } = experience.fields;

    const renderOptions = {
        renderNode: {
            [BLOCKS.EMBEDDED_ASSET]: (node) => {
                if (!node.data?.target?.fields?.file?.url) {
                    return null;
                }
                const { url } = node.data.target.fields.file;
                const { title: imgTitle } = node.data.target.fields;
                return (
                    <Image
                        src={`https:${url}`}
                        alt={imgTitle}
                        className="my-6 rounded-lg shadow-md w-full"
                        width={node.data.target.fields.file.details.image.width}
                        height={node.data.target.fields.file.details.image.height}
                        sizes="(max-width: 768px) 100vw, 800px"
                    />
                );
            },
        },
    };

    return (
        <main className="container mx-auto px-4 py-12">
            <article className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
                    {title}
                </h1>
                {featuredImage?.fields?.file?.url && (
                    <Image
                        src={`https:${featuredImage.fields.file.url}`}
                        alt={title}
                        className="w-full md:w-1/2 mx-auto h-auto rounded-xl shadow-lg mb-8"
                        width={featuredImage.fields.file.details.image.width}
                        height={featuredImage.fields.file.details.image.height}
                    />
                )}
                <div className="prose lg:prose-xl text-slate-700">
                    {documentToReactComponents(body, renderOptions)}
                </div>
            </article>
        </main>
    );
}