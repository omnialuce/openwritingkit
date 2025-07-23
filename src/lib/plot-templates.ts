// src/lib/plot-templates.ts
import { BookCopy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface PlotTemplateStep {
    id: string;
    titleKey: string;
    descriptionKey: string;
}
  
export interface PlotTemplateSection {
    titleKey: string;
    steps: PlotTemplateStep[];
}

export interface PlotTemplate {
    id: string;
    titleKey: string;
    descriptionKey: string;
    structure: PlotTemplateSection[];
}
  
export const plotTemplates: Pick<PlotTemplate, 'id' | 'titleKey' | 'descriptionKey'>[] = [
    { id: 'save-the-cat', titleKey: 'plot_tools.templates.save_the_cat.title', descriptionKey: 'plot_tools.templates.save_the_cat.description' },
    { id: 'monomyth', titleKey: 'plot_tools.templates.monomyth.title', descriptionKey: 'plot_tools.templates.monomyth.description' },
    { id: 'writers-journey', titleKey: 'plot_tools.templates.writers_journey.title', descriptionKey: 'plot_tools.templates.writers_journey.description' },
    { id: 'story-circle', titleKey: 'plot_tools.templates.story_circle.title', descriptionKey: 'plot_tools.templates.story_circle.description' },
    { id: 'fools-journey', titleKey: 'plot_tools.templates.fools_journey.title', descriptionKey: 'plot_tools.templates.fools_journey.description' },
    { id: 'novel-in-30-days', titleKey: 'plot_tools.templates.novel_in_30_days.title', descriptionKey: 'plot_tools.templates.novel_in_30_days.description' },
    { id: 'truby-22-steps', titleKey: 'plot_tools.templates.truby_22_steps.title', descriptionKey: 'plot_tools.templates.truby_22_steps.description' },
    { id: '24-chapters', titleKey: 'plot_tools.templates.24_chapters.title', descriptionKey: 'plot_tools.templates.24_chapters.description' },
    { id: '27-chapters', titleKey: 'plot_tools.templates.27_chapters.title', descriptionKey: 'plot_tools.templates.27_chapters.description' },
    { id: 'snowflake', titleKey: 'plot_tools.templates.snowflake.title', descriptionKey: 'plot_tools.templates.snowflake.description' },
];

export const fullPlotTemplates: Record<string, PlotTemplate> = {
    'save-the-cat': {
        id: 'save-the-cat',
        titleKey: 'plot_tools.templates.save_the_cat.title',
        descriptionKey: 'plot_tools.templates.save_the_cat.description',
        structure: [
            {
                titleKey: 'plot_tools.templates.save_the_cat.act1',
                steps: [
                    { id: 'opening_image', titleKey: 'plot_tools.templates.save_the_cat.opening_image', descriptionKey: 'plot_tools.templates.save_the_cat.opening_image_desc' },
                    { id: 'theme_stated', titleKey: 'plot_tools.templates.save_the_cat.theme_stated', descriptionKey: 'plot_tools.templates.save_the_cat.theme_stated_desc' },
                    { id: 'setup', titleKey: 'plot_tools.templates.save_the_cat.setup', descriptionKey: 'plot_tools.templates.save_the_cat.setup_desc' },
                    { id: 'catalyst', titleKey: 'plot_tools.templates.save_the_cat.catalyst', descriptionKey: 'plot_tools.templates.save_the_cat.catalyst_desc' },
                    { id: 'debate', titleKey: 'plot_tools.templates.save_the_cat.debate', descriptionKey: 'plot_tools.templates.save_the_cat.debate_desc' },
                ]
            },
            {
                titleKey: 'plot_tools.templates.save_the_cat.act2',
                steps: [
                    { id: 'break_into_two', titleKey: 'plot_tools.templates.save_the_cat.break_into_two', descriptionKey: 'plot_tools.templates.save_the_cat.break_into_two_desc' },
                    { id: 'b_story', titleKey: 'plot_tools.templates.save_the_cat.b_story', descriptionKey: 'plot_tools.templates.save_the_cat.b_story_desc' },
                    { id: 'fun_and_games', titleKey: 'plot_tools.templates.save_the_cat.fun_and_games', descriptionKey: 'plot_tools.templates.save_the_cat.fun_and_games_desc' },
                    { id: 'midpoint', titleKey: 'plot_tools.templates.save_the_cat.midpoint', descriptionKey: 'plot_tools.templates.save_the_cat.midpoint_desc' },
                    { id: 'bad_guys_close_in', titleKey: 'plot_tools.templates.save_the_cat.bad_guys_close_in', descriptionKey: 'plot_tools.templates.save_the_cat.bad_guys_close_in_desc' },
                    { id: 'all_is_lost', titleKey: 'plot_tools.templates.save_the_cat.all_is_lost', descriptionKey: 'plot_tools.templates.save_the_cat.all_is_lost_desc' },
                    { id: 'dark_night_of_the_soul', titleKey: 'plot_tools.templates.save_the_cat.dark_night_of_the_soul', descriptionKey: 'plot_tools.templates.save_the_cat.dark_night_of_the_soul_desc' },
                ]
            },
            {
                titleKey: 'plot_tools.templates.save_the_cat.act3',
                steps: [
                    { id: 'break_into_three', titleKey: 'plot_tools.templates.save_the_cat.break_into_three', descriptionKey: 'plot_tools.templates.save_the_cat.break_into_three_desc' },
                    { id: 'finale', titleKey: 'plot_tools.templates.save_the_cat.finale', descriptionKey: 'plot_tools.templates.save_the_cat.finale_desc' },
                    { id: 'final_image', titleKey: 'plot_tools.templates.save_the_cat.final_image', descriptionKey: 'plot_tools.templates.save_the_cat.final_image_desc' },
                ]
            }
        ]
    },
    'monomyth': {
        id: 'monomyth',
        titleKey: 'plot_tools.templates.monomyth.title',
        descriptionKey: 'plot_tools.templates.monomyth.description',
        structure: [
             {
                titleKey: 'plot_tools.templates.monomyth.act1',
                steps: [
                    { id: 'ordinary_world', titleKey: 'plot_tools.templates.monomyth.ordinary_world', descriptionKey: 'plot_tools.templates.monomyth.ordinary_world_desc' },
                    { id: 'call_to_adventure', titleKey: 'plot_tools.templates.monomyth.call_to_adventure', descriptionKey: 'plot_tools.templates.monomyth.call_to_adventure_desc' },
                    { id: 'refusal_of_the_call', titleKey: 'plot_tools.templates.monomyth.refusal_of_the_call', descriptionKey: 'plot_tools.templates.monomyth.refusal_of_the_call_desc' },
                    { id: 'meeting_the_mentor', titleKey: 'plot_tools.templates.monomyth.meeting_the_mentor', descriptionKey: 'plot_tools.templates.monomyth.meeting_the_mentor_desc' },
                    { id: 'crossing_the_threshold', titleKey: 'plot_tools.templates.monomyth.crossing_the_threshold', descriptionKey: 'plot_tools.templates.monomyth.crossing_the_threshold_desc' },
                ]
            },
            {
                titleKey: 'plot_tools.templates.monomyth.act2',
                steps: [
                    { id: 'tests_allies_enemies', titleKey: 'plot_tools.templates.monomyth.tests_allies_enemies', descriptionKey: 'plot_tools.templates.monomyth.tests_allies_enemies_desc' },
                    { id: 'approach_to_inmost_cave', titleKey: 'plot_tools.templates.monomyth.approach_to_inmost_cave', descriptionKey: 'plot_tools.templates.monomyth.approach_to_inmost_cave_desc' },
                    { id: 'ordeal', titleKey: 'plot_tools.templates.monomyth.ordeal', descriptionKey: 'plot_tools.templates.monomyth.ordeal_desc' },
                    { id: 'reward', titleKey: 'plot_tools.templates.monomyth.reward', descriptionKey: 'plot_tools.templates.monomyth.reward_desc' },
                ]
            },
            {
                titleKey: 'plot_tools.templates.monomyth.act3',
                steps: [
                    { id: 'the_road_back', titleKey: 'plot_tools.templates.monomyth.the_road_back', descriptionKey: 'plot_tools.templates.monomyth.the_road_back_desc' },
                    { id: 'resurrection', titleKey: 'plot_tools.templates.monomyth.resurrection', descriptionKey: 'plot_tools.templates.monomyth.resurrection_desc' },
                    { id: 'return_with_elixir', titleKey: 'plot_tools.templates.monomyth.return_with_elixir', descriptionKey: 'plot_tools.templates.monomyth.return_with_elixir_desc' },
                ]
            }
        ]
    },
    // Add other full templates here...
    'writers-journey': {
        id: 'writers-journey',
        titleKey: 'plot_tools.templates.writers_journey.title',
        descriptionKey: 'plot_tools.templates.writers_journey.description',
        structure: [] // Placeholder
    },
    'story-circle': {
        id: 'story-circle',
        titleKey: 'plot_tools.templates.story_circle.title',
        descriptionKey: 'plot_tools.templates.story_circle.description',
        structure: [] // Placeholder
    },
    'fools-journey': {
        id: 'fools-journey',
        titleKey: 'plot_tools.templates.fools_journey.title',
        descriptionKey: 'plot_tools.templates.fools_journey.description',
        structure: [] // Placeholder
    },
    'novel-in-30-days': {
        id: 'novel-in-30-days',
        titleKey: 'plot_tools.templates.novel_in_30_days.title',
        descriptionKey: 'plot_tools.templates.novel_in_30_days.description',
        structure: [] // Placeholder
    },
    'truby-22-steps': {
        id: 'truby-22-steps',
        titleKey: 'plot_tools.templates.truby_22_steps.title',
        descriptionKey: 'plot_tools.templates.truby_22_steps.description',
        structure: [] // Placeholder
    },
    '24-chapters': {
        id: '24-chapters',
        titleKey: 'plot_tools.templates.24_chapters.title',
        descriptionKey: 'plot_tools.templates.24_chapters.description',
        structure: [] // Placeholder
    },
    '27-chapters': {
        id: '27-chapters',
        titleKey: 'plot_tools.templates.27_chapters.title',
        descriptionKey: 'plot_tools.templates.27_chapters.description',
        structure: [] // Placeholder
    },
    'snowflake': {
        id: 'snowflake',
        titleKey: 'plot_tools.templates.snowflake.title',
        descriptionKey: 'plot_tools.templates.snowflake.description',
        structure: [] // Placeholder
    },
};
