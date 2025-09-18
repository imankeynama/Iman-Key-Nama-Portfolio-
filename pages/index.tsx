import client from '../lib/contentful';
import type { GetStaticProps, InferGetStaticPropsType } from 'next';
import type { Entry, Asset } from 'contentful';
import Card from '../components/Card';
import ContactForm from '../components/ContactForm';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

// Define the Contentful "skeleton" for an Article
interface ArticleSkeleton {
  contentTypeId: 'article';
  fields: {
    title: string;
    slug: string;
    excerpt?: string;
    tags?: string[];
  };
}

// Define the Contentful "skeleton" for an Experience
interface ExperienceSkeleton {
  contentTypeId: 'experience';
  fields: {
    title: string;
    slug: string;
  };
}

// Define the Contentful "skeleton" for a Project
interface ProjectSkeleton {
  contentTypeId: 'project';
  fields: {
    title: string;
    slug: string;
    thumbnail?: Asset; // For the project image
    tags?: string[];
  };
}

// We use the Entry type with our custom skeletons to correctly type the API response
type IArticleEntry = Entry<ArticleSkeleton>;
type IProjectEntry = Entry<ProjectSkeleton>;
type IExperienceEntry = Entry<ExperienceSkeleton>;

export const getStaticProps: GetStaticProps = async () => {
  const articlesResponse = await client.getEntries<ArticleSkeleton>({
    content_type: 'article',
    select: ['sys.id', 'fields.title', 'fields.slug', 'fields.excerpt', 'fields.tags'],
  });

  const projectsResponse = await client.getEntries<ProjectSkeleton>({
    content_type: 'project',
    select: ['sys.id', 'fields.title', 'fields.slug', 'fields.thumbnail', 'fields.tags'],
  });

  const experiencesResponse = await client.getEntries<ExperienceSkeleton>({
    content_type: 'experience',
    select: ['sys.id', 'fields.title', 'fields.slug'],
  });

  return {
    props: {
      articles: articlesResponse.items as IArticleEntry[],
      projects: projectsResponse.items as IProjectEntry[],
      experiences: experiencesResponse.items as IExperienceEntry[],
    },
    revalidate: 60,
  };
};

// This correctly infers the type of the props from getStaticProps
type Props = InferGetStaticPropsType<typeof getStaticProps>;

// We now explicitly type the 'articles' and 'projects' parameters
export default function Home({ articles, projects, experiences }: Props) {
  // State for Articles
  const [articleSearch, setArticleSearch] = useState('');
  const [articleSort, setArticleSort] = useState<'asc' | 'desc'>('asc');
  const [filteredArticles, setFilteredArticles] = useState(articles);

  // State for Gallery (Projects)
  const [projectSearch, setProjectSearch] = useState('');
  const [projectSort, setProjectSort] = useState<'asc' | 'desc'>('asc');
  const [filteredProjects, setFilteredProjects] = useState(projects);

  // Effect for Articles
  useEffect(() => {
    let tempArticles = [...articles];

    // Filter by search term (tags)
    if (articleSearch) {
      tempArticles = tempArticles.filter(article =>
        article.fields.tags?.some(tag =>
          tag.toLowerCase().includes(articleSearch.toLowerCase())
        )
      );
    }

    // Sort
    tempArticles.sort((a, b) => {
      return articleSort === 'asc'
        ? a.fields.title.localeCompare(b.fields.title)
        : b.fields.title.localeCompare(a.fields.title);
    });

    setFilteredArticles(tempArticles);
  }, [articles, articleSearch, articleSort]);

  // Effect for Projects
  useEffect(() => {
    let tempProjects = [...projects];

    if (projectSearch) {
      tempProjects = tempProjects.filter(project =>
        project.fields.tags?.some(tag =>
          tag.toLowerCase().includes(projectSearch.toLowerCase())
        )
      );
    }

    tempProjects.sort((a, b) => projectSort === 'asc' ? a.fields.title.localeCompare(b.fields.title) : b.fields.title.localeCompare(a.fields.title));
    setFilteredProjects(tempProjects);
  }, [projects, projectSearch, projectSort]);
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="text-left my-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-4 md:text-5xl">
          Iman Key Nama
        </h1>
        <p className="text-lg italic text-slate-600 max-w-2xl">
          Project Manager and Product Developer with a passion for creating innovative solutions in multimedia and intelligent systems.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold text-slate-800 mb-6 border-b pb-2">
          Work Experience
        </h2>
        {experiences.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {experiences.map((experience) => (
              <Card
                key={experience.sys.id}
                // This will link to a future experience details page
                href={`/experience/${experience.fields.slug}`}
                title={experience.fields.title}
              />
            ))}
          </div>
        ) : (
          <p className="text-slate-500">No experiences found.</p>
        )}
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-16">
        <section className="mb-16 md:mb-0">
          <h2 className="text-3xl font-bold text-slate-800 mb-6 border-b pb-2">
            Articles
          </h2>
          <div className="flex justify-between items-center mb-4">
            <input
              type="text"
              placeholder="Search by tag..."
              className="px-3 py-1 border border-slate-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              value={articleSearch}
              onChange={(e) => setArticleSearch(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setArticleSort('asc')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${articleSort === 'asc' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
              >
                Asc
              </button>
              <button
                onClick={() => setArticleSort('desc')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${articleSort === 'desc' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
              >
                Desc
              </button>
            </div>
          </div>
          {filteredArticles.length > 0 ? (
            <div className="h-96 overflow-y-auto border border-slate-200 rounded-lg bg-white shadow-sm">
              <ul>
                {filteredArticles.map((article, index) => (
                  <li key={article.sys.id}>
                    <Link
                      href={`/articles/${article.fields.slug}`}
                      className={`block px-4 py-2 transition-colors duration-200 hover:bg-slate-50 ${index !== articles.length - 1 ? 'border-b border-slate-200' : ''
                        }`}
                    >
                      <h3 className="text-sm font-medium text-slate-800">{article.fields.title}</h3>
                      {article.fields.excerpt && (
                        <p className="text-sm italic text-slate-600 mt-1">{article.fields.excerpt}</p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-slate-500 text-center py-16">No articles found.</p>
          )}
        </section>

        <section>
          <h2 className="text-3xl font-bold text-slate-800 mb-6 border-b pb-2">
            Gallery
          </h2>
          <div className="flex justify-between items-center mb-4">
            <input
              type="text"
              placeholder="Search by tag..."
              className="px-3 py-1 border border-slate-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setProjectSort('asc')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${projectSort === 'asc' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
              >
                Asc
              </button>
              <button
                onClick={() => setProjectSort('desc')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${projectSort === 'desc' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
              >
                Desc
              </button>
            </div>
          </div>
          {filteredProjects.length > 0 ? (
            <div className="h-96 overflow-y-auto border border-slate-200 rounded-lg bg-white shadow-sm p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProjects.map((project) => (
                  <Card
                    key={project.sys.id}
                    href={`/projects/${project.fields.slug}`}
                    title={project.fields.title}
                    imageUrl={
                      project.fields.thumbnail?.fields?.file?.url
                        ? `https:${project.fields.thumbnail.fields.file.url}`
                        : undefined
                    }
                  />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-center py-16">No projects found.</p>
          )}
        </section>
      </div>

      <section className="mt-24">
        <ContactForm />
      </section>
    </div>
  );
}