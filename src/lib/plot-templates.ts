
// src/lib/plot-templates.ts
import type { TranslationKey } from './i18n-keys';

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

export const plotTemplates: PlotTemplate[] = [
  {
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
        ],
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
        ],
      },
      {
        titleKey: 'plot_tools.templates.save_the_cat.act3',
        steps: [
          { id: 'break_into_three', titleKey: 'plot_tools.templates.save_the_cat.break_into_three', descriptionKey: 'plot_tools.templates.save_the_cat.break_into_three_desc' },
          { id: 'finale', titleKey: 'plot_tools.templates.save_the_cat.finale', descriptionKey: 'plot_tools.templates.save_the_cat.finale_desc' },
          { id: 'final_image', titleKey: 'plot_tools.templates.save_the_cat.final_image', descriptionKey: 'plot_tools.templates.save_the_cat.final_image_desc' },
        ],
      },
    ],
  },
  {
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
        ],
      },
      {
        titleKey: 'plot_tools.templates.monomyth.act2',
        steps: [
          { id: 'tests_allies_enemies', titleKey: 'plot_tools.templates.monomyth.tests_allies_enemies', descriptionKey: 'plot_tools.templates.monomyth.tests_allies_enemies_desc' },
          { id: 'approach_to_inmost_cave', titleKey: 'plot_tools.templates.monomyth.approach_to_inmost_cave', descriptionKey: 'plot_tools.templates.monomyth.approach_to_inmost_cave_desc' },
          { id: 'ordeal', titleKey: 'plot_tools.templates.monomyth.ordeal', descriptionKey: 'plot_tools.templates.monomyth.ordeal_desc' },
          { id: 'reward', titleKey: 'plot_tools.templates.monomyth.reward', descriptionKey: 'plot_tools.templates.monomyth.reward_desc' },
        ],
      },
      {
        titleKey: 'plot_tools.templates.monomyth.act3',
        steps: [
          { id: 'the_road_back', titleKey: 'plot_tools.templates.monomyth.the_road_back', descriptionKey: 'plot_tools.templates.monomyth.the_road_back_desc' },
          { id: 'resurrection', titleKey: 'plot_tools.templates.monomyth.resurrection', descriptionKey: 'plot_tools.templates.monomyth.resurrection_desc' },
          { id: 'return_with_elixir', titleKey: 'plot_tools.templates.monomyth.return_with_elixir', descriptionKey: 'plot_tools.templates.monomyth.return_with_elixir_desc' },
        ],
      },
    ],
  },
  {
    id: 'story-circle',
    titleKey: 'plot_tools.templates.story_circle.title',
    descriptionKey: 'plot_tools.templates.story_circle.description',
    structure: [
      {
        titleKey: 'plot_tools.templates.story_circle.steps_title',
        steps: [
          { id: 'sc_you', titleKey: 'plot_tools.templates.story_circle.you', descriptionKey: 'plot_tools.templates.story_circle.you_desc' },
          { id: 'sc_need', titleKey: 'plot_tools.templates.story_circle.need', descriptionKey: 'plot_tools.templates.story_circle.need_desc' },
          { id: 'sc_go', titleKey: 'plot_tools.templates.story_circle.go', descriptionKey: 'plot_tools.templates.story_circle.go_desc' },
          { id: 'sc_search', titleKey: 'plot_tools.templates.story_circle.search', descriptionKey: 'plot_tools.templates.story_circle.search_desc' },
          { id: 'sc_find', titleKey: 'plot_tools.templates.story_circle.find', descriptionKey: 'plot_tools.templates.story_circle.find_desc' },
          { id: 'sc_take', titleKey: 'plot_tools.templates.story_circle.take', descriptionKey: 'plot_tools.templates.story_circle.take_desc' },
          { id: 'sc_return', titleKey: 'plot_tools.templates.story_circle.return', descriptionKey: 'plot_tools.templates.story_circle.return_desc' },
          { id: 'sc_change', titleKey: 'plot_tools.templates.story_circle.change', descriptionKey: 'plot_tools.templates.story_circle.change_desc' },
        ],
      },
    ],
  },
  {
    id: 'snowflake',
    titleKey: 'plot_tools.templates.snowflake.title',
    descriptionKey: 'plot_tools.templates.snowflake.description',
    structure: [
      {
        titleKey: 'plot_tools.templates.snowflake.steps_title',
        steps: [
          { id: 'sf_one_sentence', titleKey: 'plot_tools.templates.snowflake.one_sentence', descriptionKey: 'plot_tools.templates.snowflake.one_sentence_desc' },
          { id: 'sf_one_paragraph', titleKey: 'plot_tools.templates.snowflake.one_paragraph', descriptionKey: 'plot_tools.templates.snowflake.one_paragraph_desc' },
          { id: 'sf_character_synopses', titleKey: 'plot_tools.templates.snowflake.character_synopses', descriptionKey: 'plot_tools.templates.snowflake.character_synopses_desc' },
          { id: 'sf_expand_to_paragraphs', titleKey: 'plot_tools.templates.snowflake.expand_to_paragraphs', descriptionKey: 'plot_tools.templates.snowflake.expand_to_paragraphs_desc' },
          { id: 'sf_character_one_pagers', titleKey: 'plot_tools.templates.snowflake.character_one_pagers', descriptionKey: 'plot_tools.templates.snowflake.character_one_pagers_desc' },
          { id: 'sf_four_page_synopsis', titleKey: 'plot_tools.templates.snowflake.four_page_synopsis', descriptionKey: 'plot_tools.templates.snowflake.four_page_synopsis_desc' },
          { id: 'sf_character_charts', titleKey: 'plot_tools.templates.snowflake.character_charts', descriptionKey: 'plot_tools.templates.snowflake.character_charts_desc' },
          { id: 'sf_scene_list', titleKey: 'plot_tools.templates.snowflake.scene_list', descriptionKey: 'plot_tools.templates.snowflake.scene_list_desc' },
          { id: 'sf_narrative_prose', titleKey: 'plot_tools.templates.snowflake.narrative_prose', descriptionKey: 'plot_tools.templates.snowflake.narrative_prose_desc' },
          { id: 'sf_first_draft', titleKey: 'plot_tools.templates.snowflake.first_draft', descriptionKey: 'plot_tools.templates.snowflake.first_draft_desc' },
        ]
      }
    ]
  }
];
