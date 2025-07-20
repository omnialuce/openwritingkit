// src/app/(app)/resources/page.tsx
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Newspaper, Mic, ExternalLink, Lightbulb, Wrench, Tv, BookHeart, FileText } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

type ResourceType = 'Podcast' | 'Blog' | 'Tool' | 'Inspiration' | 'Article' | 'Guide' | 'Planning';

interface Resource {
  titleKey: string;
  descriptionKey: string;
  href: string;
  type: ResourceType;
  icon: React.ElementType;
}

const resources: Resource[] = [
  // Podcasts
  { titleKey: "resources.list.self_publishing_podcast.title", descriptionKey: "resources.list.self_publishing_podcast.description", href: "https://selfpublishingpodcast.com/", type: "Podcast", icon: Mic },
  { titleKey: "resources.list.shutup_write.title", descriptionKey: "resources.list.shutup_write.description", href: "http://shutupandwrite.net/", type: "Podcast", icon: Mic },
  { titleKey: "resources.list.rocking_self_publishing.title", descriptionKey: "resources.list.rocking_self_publishing.description", href: "http://rockingselfpublishing.com/", type: "Podcast", icon: Mic },
  { titleKey: "resources.list.dead_robots_society.title", descriptionKey: "resources.list.dead_robots_society.description", href: "http://deadrobotssociety.com/", type: "Podcast", icon: Mic },
  { titleKey: "resources.list.grammar_girl.title", descriptionKey: "resources.list.grammar_girl.description", href: "http://itunes.apple.com/us/podcast/grammar-girl-quick-dirty-tips/id173429229?mt=2", type: "Podcast", icon: Mic },
  
  // Blogs
  { titleKey: "resources.list.reedsy_blog.title", descriptionKey: "resources.list.reedsy_blog.description", href: "https://blog.reedsy.com/", type: "Blog", icon: Newspaper },
  { titleKey: "resources.list.creative_penn.title", descriptionKey: "resources.list.creative_penn.description", href: "https://www.thecreativepenn.com/", type: "Blog", icon: Newspaper },
  { titleKey: "resources.list.terrible_minds.title", descriptionKey: "resources.list.terrible_minds.description", href: "http://terribleminds.com/", type: "Blog", icon: Newspaper },
  { titleKey: "resources.list.storyfix.title", descriptionKey: "resources.list.storyfix.description", href: "http://storyfix.com/", type: "Blog", icon: Newspaper },
  { titleKey: "resources.list.copyblogger.title", descriptionKey: "resources.list.copyblogger.description", href: "http://www.copyblogger.com/", type: "Blog", icon: Newspaper },
  { titleKey: "resources.list.litreactor.title", descriptionKey: "resources.list.litreactor.description", href: "http://litreactor.com/", type: "Blog", icon: Newspaper },
  { titleKey: "resources.list.rewrite_reword.title", descriptionKey: "resources.list.rewrite_reword.description", href: "http://rewriterewordrework.wordpress.com/", type: "Blog", icon: Newspaper },
  { titleKey: "resources.list.slushpile_hell.title", descriptionKey: "resources.list.slushpile_hell.description", href: "http://slushpilehell.tumblr.com/", type: "Blog", icon: Newspaper },

  // Tools
  { titleKey: "resources.list.one_stop.title", descriptionKey: "resources.list.one_stop.description", href: "https://onestopforwriters.com/", type: "Tool", icon: Wrench },
  { titleKey: "resources.list.scribophile.title", descriptionKey: "resources.list.scribophile.description", href: "https://www.scribophile.com", type: "Tool", icon: Wrench },
  { titleKey: "resources.list.submittable.title", descriptionKey: "resources.list.submittable.description", href: "https://www.submittable.com/", type: "Tool", icon: Wrench },
  { titleKey: "resources.list.the_grinder.title", descriptionKey: "resources.list.the_grinder.description", href: "https://thegrinder.diabolicalplots.com/", type: "Tool", icon: Wrench },
  { titleKey: "resources.list.reedsy_title_gen.title", descriptionKey: "resources.list.reedsy_title_gen.description", href: "https://blog.reedsy.com/book-title-generator/", type: "Tool", icon: Wrench },
  { titleKey: "resources.list.behind_the_name.title", descriptionKey: "resources.list.behind_the_name.description", href: "https://www.behindthename.com/", type: "Tool", icon: Wrench },
  { titleKey: "resources.list.word_counters.title", descriptionKey: "resources.list.word_counters.description", href: "http://wordcounters.com/word-count/search.jsp", type: "Tool", icon: Wrench },

  // Inspiration
  { titleKey: "resources.list.inspiration_youtube_1.title", descriptionKey: "resources.list.inspiration_youtube_1.description", href: "https://youtu.be/lwhOd65gGoY", type: "Inspiration", icon: Lightbulb },
  { titleKey: "resources.list.emotion_thesaurus.title", descriptionKey: "resources.list.emotion_thesaurus.description", href: "https://www.bookdepository.com/Emotion-Thesaurus-Angela-Ackerman/9780999296349", type: "Inspiration", icon: BookHeart },
  { titleKey: "resources.list.inspiration_youtube_3.title", descriptionKey: "resources.list.inspiration_youtube_3.description", href: "https://youtu.be/5ifMRNag2XU", type: "Inspiration", icon: Lightbulb },
  { titleKey: "resources.list.bird_by_bird.title", descriptionKey: "resources.list.bird_by_bird.description", href: "https://www.bookdepository.com/Bird-By-Bird-Anne-Lamott/9780385480017", type: "Inspiration", icon: BookHeart },
  { titleKey: "resources.list.inspiration_youtube_4.title", descriptionKey: "resources.list.inspiration_youtube_4.description", href: "https://m.youtube.com/watch?v=vIcnmiT0Mc8&index=1&list=PLTCv6n1whoI23GmdBZienRW0Q0nFCU_ay", type: "Inspiration", icon: Lightbulb },
  
  // Articles
  { titleKey: "resources.list.article_character_setting.title", descriptionKey: "resources.list.article_character_setting.description", href: "https://www.writersideoflife.com/showing-character-through-setting/", type: "Article", icon: FileText },
  { titleKey: "resources.list.article_research_tips.title", descriptionKey: "resources.list.article_research_tips.description", href: "https://writersedit.com/fiction-writing/top-7-tips-researching-novel/", type: "Article", icon: FileText },
  { titleKey: "resources.list.article_after_book.title", descriptionKey: "resources.list.article_after_book.description", href: "https://thewritepractice.com/after-book/", type: "Article", icon: FileText },
  { titleKey: "resources.list.article_beta_reader.title", descriptionKey: "resources.list.article_beta_reader.description", href: "https://thinkingthroughourfingers.com/2016/07/01/six-sets-of-questions-to-ask-as-a-beta-reader/", type: "Article", icon: FileText },
  { titleKey: "resources.list.article_free_marketing.title", descriptionKey: "resources.list.article_free_marketing.description", href: "https://thinkwritten.com/free-book-marketing/", type: "Article", icon: FileText },
  { titleKey: "resources.list.article_pinterest.title", descriptionKey: "resources.list.article_pinterest.description", href: "https://www.writersideoflife.com/pinterest-bloggers/", type: "Article", icon: FileText },
  { titleKey: "resources.list.article_book_genre.title", descriptionKey: "resources.list.article_book_genre.description", href: "https://justpublishingadvice.com/do-you-know-your-book-genre/", type: "Article", icon: FileText },
  { titleKey: "resources.list.article_who_reading.title", descriptionKey: "resources.list.article_who_reading.description", href: "https://www.writersideoflife.com/who-are-you-reading/", type: "Article", icon: FileText },
  { titleKey: "resources.list.article_short_story_comps.title", descriptionKey: "resources.list.article_short_story_comps.description", href: "https://www.writersideoflife.com/short-story-competitions/", type: "Article", icon: FileText },
  { titleKey: "resources.list.article_legal_tips.title", descriptionKey: "resources.list.article_legal_tips.description", href: "https://prowritingaid.com/art/755/7-legal-tips-for-writers.aspx", type: "Article", icon: FileText },
  { titleKey: "resources.list.article_copyright.title", descriptionKey: "resources.list.article_copyright.description", href: "https://www.wipo.int/edocs/pubdocs/en/copyright/868/wipo_pub_868.pdf", type: "Article", icon: FileText },
  { titleKey: "resources.list.article_100_websites.title", descriptionKey: "resources.list.article_100_websites.description", href: "https://thewritelife.com/100-best-websites-for-writers-2018/", type: "Article", icon: FileText },
  
  // Guides
  { titleKey: "resources.list.helping_writers.title", descriptionKey: "resources.list.helping_writers.description", href: "https://www.helpingwritersbecomeauthors.com/", type: "Guide", icon: BookOpen },
  { titleKey: "resources.list.writing_bad.title", descriptionKey: "resources.list.writing_bad.description", href: "http://writingbad.org/", type: "Guide", icon: BookOpen },
  { titleKey: "resources.list.writers_digest.title", descriptionKey: "resources.list.writers_digest.description", href: "https://www.writersdigest.com/", type: "Guide", icon: BookOpen },
  { titleKey: "resources.list.self_pub_bootcamp.title", descriptionKey: "resources.list.self_pub_bootcamp.description", href: "https://selfpubbootcamp.com/", type: "Guide", icon: BookOpen },
  
  // Planning
  { titleKey: "resources.list.planning_worksheets.title", descriptionKey: "resources.list.planning_worksheets.description", href: "https://jamigold.com/for-writers/worksheets-for-writers/#Save-the-Cat", type: "Planning", icon: Tv },
  { titleKey: "resources.list.planning_take_off_pants.title", descriptionKey: "resources.list.planning_take_off_pants.description", href: "https://www.amazon.com/Take-Off-Your-Pants-Outline-ebook/dp/B00UKC0GHA", type: "Planning", icon: Tv },
];


const resourceTypes: ResourceType[] = ['Podcast', 'Blog', 'Tool', 'Inspiration', 'Article', 'Guide', 'Planning'];

export default function ResourcesPage() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<ResourceType | 'All'>('All');
  
  const getResourceTypeTranslation = (type: ResourceType) => {
    return t(`resources.types.${type.toLowerCase()}` as any);
  };
  
  const filteredResources = filter === 'All' 
    ? resources 
    : resources.filter(resource => resource.type === filter);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <BookOpen className="mr-3 h-8 w-8 text-primary" />
          {t('resources.title')}
        </h1>
        <p className="text-muted-foreground">{t('resources.description')}</p>
      </div>

       <div className="flex flex-wrap gap-2">
        <Button 
            variant={filter === 'All' ? 'default' : 'outline'}
            onClick={() => setFilter('All')}
        >
            {t('resources.types.all')}
        </Button>
        {resourceTypes.map(type => (
            <Button
                key={type}
                variant={filter === type ? 'default' : 'outline'}
                onClick={() => setFilter(type)}
            >
                {getResourceTypeTranslation(type)}
            </Button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredResources.map(resource => (
          <Card key={resource.titleKey} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <resource.icon className="h-8 w-8 text-primary" />
                <span className="text-xs font-semibold bg-secondary text-secondary-foreground px-2 py-1 rounded-full">{getResourceTypeTranslation(resource.type)}</span>
              </div>
              <CardTitle>{t(resource.titleKey as any)}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription>{t(resource.descriptionKey as any)}</CardDescription>
            </CardContent>
            <CardContent>
              <Link href={resource.href} target="_blank" rel="noopener noreferrer" passHref>
                <Button variant="outline" className="w-full">
                  {t('resources.visit_site')} <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
       {filteredResources.length === 0 && (
         <Card>
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground">{t('resources.no_results', { filter: getResourceTypeTranslation(filter as ResourceType) })}</p>
          </CardContent>
        </Card>
       )}
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{t('resources.suggestion_box.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t('resources.suggestion_box.description')}
            <br />
            <a href="https://www.writersideoflife.com/writing-resources" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{t('resources.suggestion_box.source_credit')}</a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
