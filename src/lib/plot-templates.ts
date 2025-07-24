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
    id: 'fools-journey',
    titleKey: 'plot_tools.templates.fools_journey.title',
    descriptionKey: 'plot_tools.templates.fools_journey.description',
    structure: [
      {
        titleKey: 'plot_tools.templates.fools_journey.steps_title',
        steps: [
          { id: 'fj_ordinary_world', titleKey: 'plot_tools.templates.fools_journey.ordinary_world', descriptionKey: 'plot_tools.templates.fools_journey.ordinary_world_desc' },
          { id: 'fj_refusal_of_the_call', titleKey: 'plot_tools.templates.fools_journey.refusal_of_the_call', descriptionKey: 'plot_tools.templates.fools_journey.refusal_of_the_call_desc' },
          { id: 'fj_meeting_the_mentor', titleKey: 'plot_tools.templates.fools_journey.meeting_the_mentor', descriptionKey: 'plot_tools.templates.fools_journey.meeting_the_mentor_desc' },
          { id: 'fj_crossing_the_threshold', titleKey: 'plot_tools.templates.fools_journey.crossing_the_threshold', descriptionKey: 'plot_tools.templates.fools_journey.crossing_the_threshold_desc' },
          { id: 'fj_tests_allies_enemies', titleKey: 'plot_tools.templates.fools_journey.tests_allies_enemies', descriptionKey: 'plot_tools.templates.fools_journey.tests_allies_enemies_desc' },
          { id: 'fj_approach', titleKey: 'plot_tools.templates.fools_journey.approach', descriptionKey: 'plot_tools.templates.fools_journey.approach_desc' },
          { id: 'fj_ordeal_death_rebirth', titleKey: 'plot_tools.templates.fools_journey.ordeal_death_rebirth', descriptionKey: 'plot_tools.templates.fools_journey.ordeal_death_rebirth_desc' },
          { id: 'fj_reward', titleKey: 'plot_tools.templates.fools_journey.reward', descriptionKey: 'plot_tools.templates.fools_journey.reward_desc' },
          { id: 'fj_the_road_back', titleKey: 'plot_tools.templates.fools_journey.the_road_back', descriptionKey: 'plot_tools.templates.fools_journey.the_road_back_desc' },
          { id: 'fj_resurrection', titleKey: 'plot_tools.templates.fools_journey.resurrection', descriptionKey: 'plot_tools.templates.fools_journey.resurrection_desc' },
          { id: 'fj_return_with_the_elixir', titleKey: 'plot_tools.templates.fools_journey.return_with_the_elixir', descriptionKey: 'plot_tools.templates.fools_journey.return_with_the_elixir_desc' }
        ]
      }
    ]
  },
  {
    id: 'novel-30-days',
    titleKey: 'plot_tools.templates.novel_30_days.title',
    descriptionKey: 'plot_tools.templates.novel_30_days.description',
    structure: [
      {
        titleKey: 'plot_tools.templates.novel_30_days.steps_title',
        steps: [
          { id: 'n30_hook', titleKey: 'plot_tools.templates.novel_30_days.hook', descriptionKey: 'plot_tools.templates.novel_30_days.hook_desc' },
          { id: 'n30_inciting_incident', titleKey: 'plot_tools.templates.novel_30_days.inciting_incident', descriptionKey: 'plot_tools.templates.novel_30_days.inciting_incident_desc' },
          { id: 'n30_first_plot_point', titleKey: 'plot_tools.templates.novel_30_days.first_plot_point', descriptionKey: 'plot_tools.templates.novel_30_days.first_plot_point_desc' },
          { id: 'n30_first_pinch_point', titleKey: 'plot_tools.templates.novel_30_days.first_pinch_point', descriptionKey: 'plot_tools.templates.novel_30_days.first_pinch_point_desc' },
          { id: 'n30_midpoint', titleKey: 'plot_tools.templates.novel_30_days.midpoint', descriptionKey: 'plot_tools.templates.novel_30_days.midpoint_desc' },
          { id: 'n30_second_pinch_point', titleKey: 'plot_tools.templates.novel_30_days.second_pinch_point', descriptionKey: 'plot_tools.templates.novel_30_days.second_pinch_point_desc' },
          { id: 'n30_third_plot_point', titleKey: 'plot_tools.templates.novel_30_days.third_plot_point', descriptionKey: 'plot_tools.templates.novel_30_days.third_plot_point_desc' },
          { id: 'n30_climax', titleKey: 'plot_tools.templates.novel_30_days.climax', descriptionKey: 'plot_tools.templates.novel_30_days.climax_desc' },
          { id: 'n30_resolution', titleKey: 'plot_tools.templates.novel_30_days.resolution', descriptionKey: 'plot_tools.templates.novel_30_days.resolution_desc' }
        ]
      }
    ]
  },
  {
    id: 'truby-22',
    titleKey: 'plot_tools.templates.truby_22.title',
    descriptionKey: 'plot_tools.templates.truby_22.description',
    structure: [
      {
        titleKey: 'plot_tools.templates.truby_22.steps_title',
        steps: [
          { id: 't22_self_revelation_need_desire', titleKey: 'plot_tools.templates.truby_22.self_revelation_need_desire', descriptionKey: 'plot_tools.templates.truby_22.self_revelation_need_desire_desc' },
          { id: 't22_ghost_and_story_world', titleKey: 'plot_tools.templates.truby_22.ghost_and_story_world', descriptionKey: 'plot_tools.templates.truby_22.ghost_and_story_world_desc' },
          { id: 't22_weakness_and_need', titleKey: 'plot_tools.templates.truby_22.weakness_and_need', descriptionKey: 'plot_tools.templates.truby_22.weakness_and_need_desc' },
          { id: 't22_inciting_incident', titleKey: 'plot_tools.templates.truby_22.inciting_incident', descriptionKey: 'plot_tools.templates.truby_22.inciting_incident_desc' },
          { id: 't22_desire', titleKey: 'plot_tools.templates.truby_22.desire', descriptionKey: 'plot_tools.templates.truby_22.desire_desc' },
          { id: 't22_ally_or_allies', titleKey: 'plot_tools.templates.truby_22.ally_or_allies', descriptionKey: 'plot_tools.templates.truby_22.ally_or_allies_desc' },
          { id: 't22_opponent_and_or_mystery', titleKey: 'plot_tools.templates.truby_22.opponent_and_or_mystery', descriptionKey: 'plot_tools.templates.truby_22.opponent_and_or_mystery_desc' },
          { id: 't22_fake_ally_opponent', titleKey: 'plot_tools.templates.truby_22.fake_ally_opponent', descriptionKey: 'plot_tools.templates.truby_22.fake_ally_opponent_desc' },
          { id: 't22_first_revelation_and_decision', titleKey: 'plot_tools.templates.truby_22.first_revelation_and_decision', descriptionKey: 'plot_tools.templates.truby_22.first_revelation_and_decision_desc' },
          { id: 't22_plan', titleKey: 'plot_tools.templates.truby_22.plan', descriptionKey: 'plot_tools.templates.truby_22.plan_desc' },
          { id: 't22_opponents_plan_and_main_counterattack', titleKey: 'plot_tools.templates.truby_22.opponents_plan_and_main_counterattack', descriptionKey: 'plot_tools.templates.truby_22.opponents_plan_and_main_counterattack_desc' },
          { id: 't22_drive', titleKey: 'plot_tools.templates.truby_22.drive', descriptionKey: 'plot_tools.templates.truby_22.drive_desc' },
          { id: 't22_attack_by_ally', titleKey: 'plot_tools.templates.truby_22.attack_by_ally', descriptionKey: 'plot_tools.templates.truby_22.attack_by_ally_desc' },
          { id: 't22_apparent_defeat', titleKey: 'plot_tools.templates.truby_22.apparent_defeat', descriptionKey: 'plot_tools.templates.truby_22.apparent_defeat_desc' },
          { id: 't22_second_revelation_and_decision', titleKey: 'plot_tools.templates.truby_22.second_revelation_and_decision', descriptionKey: 'plot_tools.templates.truby_22.second_revelation_and_decision_desc' },
          { id: 't22_audience_revelation', titleKey: 'plot_tools.templates.truby_22.audience_revelation', descriptionKey: 'plot_tools.templates.truby_22.audience_revelation_desc' },
          { id: 't22_third_revelation_and_decision', titleKey: 'plot_tools.templates.truby_22.third_revelation_and_decision', descriptionKey: 'plot_tools.templates.truby_22.third_revelation_and_decision_desc' },
          { id: 't22_gate_gauntlet_visit_to_death', titleKey: 'plot_tools.templates.truby_22.gate_gauntlet_visit_to_death', descriptionKey: 'plot_tools.templates.truby_22.gate_gauntlet_visit_to_death_desc' },
          { id: 't22_battle', titleKey: 'plot_tools.templates.truby_22.battle', descriptionKey: 'plot_tools.templates.truby_22.battle_desc' },
          { id: 't22_self_revelation', titleKey: 'plot_tools.templates.truby_22.self_revelation', descriptionKey: 'plot_tools.templates.truby_22.self_revelation_desc' },
          { id: 't22_moral_decision', titleKey: 'plot_tools.templates.truby_22.moral_decision', descriptionKey: 'plot_tools.templates.truby_22.moral_decision_desc' },
          { id: 't22_new_equilibrium', titleKey: 'plot_tools.templates.truby_22.new_equilibrium', descriptionKey: 'plot_tools.templates.truby_22.new_equilibrium_desc' }
        ]
      }
    ]
  },
  {
    id: '24-chapter-outline',
    titleKey: 'plot_tools.templates.24_chapter_outline.title',
    descriptionKey: 'plot_tools.templates.24_chapter_outline.description',
    structure: [
      {
        titleKey: 'plot_tools.templates.24_chapter_outline.part1',
        steps: [
          { id: 'c24_ch1', titleKey: 'plot_tools.templates.24_chapter_outline.ch1', descriptionKey: 'plot_tools.templates.24_chapter_outline.ch1_desc' },
          { id: 'c24_ch2', titleKey: 'plot_tools.templates.24_chapter_outline.ch2', descriptionKey: 'plot_tools.templates.24_chapter_outline.ch2_desc' },
          { id: 'c24_ch3', titleKey: 'plot_tools.templates.24_chapter_outline.ch3', descriptionKey: 'plot_tools.templates.24_chapter_outline.ch3_desc' },
          { id: 'c24_ch4', titleKey: 'plot_tools.templates.24_chapter_outline.ch4', descriptionKey: 'plot_tools.templates.24_chapter_outline.ch4_desc' },
          { id: 'c24_ch5', titleKey: 'plot_tools.templates.24_chapter_outline.ch5', descriptionKey: 'plot_tools.templates.24_chapter_outline.ch5_desc' },
          { id: 'c24_ch6', titleKey: 'plot_tools.templates.24_chapter_outline.ch6', descriptionKey: 'plot_tools.templates.24_chapter_outline.ch6_desc' }
        ]
      },
      {
        titleKey: 'plot_tools.templates.24_chapter_outline.part2',
        steps: [
          { id: 'c24_ch7', titleKey: 'plot_tools.templates.24_chapter_outline.ch7', descriptionKey: 'plot_tools.templates.24_chapter_outline.ch7_desc' },
          { id: 'c24_ch8', titleKey: 'plot_tools.templates.24_chapter_outline.ch8', descriptionKey: 'plot_tools.templates.24_chapter_outline.ch8_desc' },
          { id: 'c24_ch9', titleKey: 'plot_tools.templates.24_chapter_outline.ch9', descriptionKey: 'plot_tools.templates.24_chapter_outline.ch9_desc' },
          { id: 'c24_ch10', titleKey: 'plot_tools.templates.24_chapter_outline.ch10', descriptionKey: 'plot_tools.templates.24_chapter_outline.ch10_desc' },
          { id: 'c24_ch11', titleKey: 'plot_tools.templates.24_chapter_outline.ch11', descriptionKey: 'plot_tools.templates.24_chapter_outline.ch11_desc' },
          { id: 'c24_ch12', titleKey: 'plot_tools.templates.24_chapter_outline.ch12', descriptionKey: 'plot_tools.templates.24_chapter_outline.ch12_desc' }
        ]
      },
      {
        titleKey: 'plot_tools.templates.24_chapter_outline.part3',
        steps: [
          { id: 'c24_ch13', titleKey: 'plot_tools.templates.24_chapter_outline.ch13', descriptionKey: 'plot_tools.templates.24_chapter_outline.ch13_desc' },
          { id: 'c24_ch14', titleKey: 'plot_tools.templates.24_chapter_outline.ch14', descriptionKey: 'plot_tools.templates.24_chapter_outline.ch14_desc' },
          { id: 'c24_ch15', titleKey: 'plot_tools.templates.24_chapter_outline.ch15', descriptionKey: 'plot_tools.templates.24_chapter_outline.ch15_desc' },
          { id: 'c24_ch16', titleKey: 'plot_tools.templates.24_chapter_outline.ch16', descriptionKey: 'plot_tools.templates.24_chapter_outline.ch16_desc' },
          { id: 'c24_ch17', titleKey: 'plot_tools.templates.24_chapter_outline.ch17', descriptionKey: 'plot_tools.templates.24_chapter_outline.ch17_desc' },
          { id: 'c24_ch18', titleKey: 'plot_tools.templates.24_chapter_outline.ch18', descriptionKey: 'plot_tools.templates.24_chapter_outline.ch18_desc' }
        ]
      },
      {
        titleKey: 'plot_tools.templates.24_chapter_outline.part4',
        steps: [
          { id: 'c24_ch19', titleKey: 'plot_tools.templates.24_chapter_outline.ch19', descriptionKey: 'plot_tools.templates.24_chapter_outline.ch19_desc' },
          { id: 'c24_ch20', titleKey: 'plot_tools.templates.24_chapter_outline.ch20', descriptionKey: 'plot_tools.templates.24_chapter_outline.ch20_desc' },
          { id: 'c24_ch21', titleKey: 'plot_tools.templates.24_chapter_outline.ch21', descriptionKey: 'plot_tools.templates.24_chapter_outline.ch21_desc' },
          { id: 'c24_ch22', titleKey: 'plot_tools.templates.24_chapter_outline.ch22', descriptionKey: 'plot_tools.templates.24_chapter_outline.ch22_desc' },
          { id: 'c24_ch23', titleKey: 'plot_tools.templates.24_chapter_outline.ch23', descriptionKey: 'plot_tools.templates.24_chapter_outline.ch23_desc' },
          { id: 'c24_ch24', titleKey: 'plot_tools.templates.24_chapter_outline.ch24', descriptionKey: 'plot_tools.templates.24_chapter_outline.ch24_desc' }
        ]
      }
    ]
  },
  {
    id: '27-chapter-outline',
    titleKey: 'plot_tools.templates.27_chapter_outline.title',
    descriptionKey: 'plot_tools.templates.27_chapter_outline.description',
    structure: [
      {
        titleKey: 'plot_tools.templates.27_chapter_outline.act1',
        steps: [
          { id: 'c27_ch1_3', titleKey: 'plot_tools.templates.27_chapter_outline.ch1_3', descriptionKey: 'plot_tools.templates.27_chapter_outline.ch1_3_desc' },
          { id: 'c27_ch4', titleKey: 'plot_tools.templates.27_chapter_outline.ch4', descriptionKey: 'plot_tools.templates.27_chapter_outline.ch4_desc' },
          { id: 'c27_ch5', titleKey: 'plot_tools.templates.27_chapter_outline.ch5', descriptionKey: 'plot_tools.templates.27_chapter_outline.ch5_desc' },
          { id: 'c27_ch6_7', titleKey: 'plot_tools.templates.27_chapter_outline.ch6_7', descriptionKey: 'plot_tools.templates.27_chapter_outline.ch6_7_desc' },
          { id: 'c27_ch8', titleKey: 'plot_tools.templates.27_chapter_outline.ch8', descriptionKey: 'plot_tools.templates.27_chapter_outline.ch8_desc' },
          { id: 'c27_ch9', titleKey: 'plot_tools.templates.27_chapter_outline.ch9', descriptionKey: 'plot_tools.templates.27_chapter_outline.ch9_desc' }
        ]
      },
      {
        titleKey: 'plot_tools.templates.27_chapter_outline.act2',
        steps: [
          { id: 'c27_ch10_11', titleKey: 'plot_tools.templates.27_chapter_outline.ch10_11', descriptionKey: 'plot_tools.templates.27_chapter_outline.ch10_11_desc' },
          { id: 'c27_ch12_14', titleKey: 'plot_tools.templates.27_chapter_outline.ch12_14', descriptionKey: 'plot_tools.templates.27_chapter_outline.ch12_14_desc' },
          { id: 'c27_ch15_16', titleKey: 'plot_tools.templates.27_chapter_outline.ch15_16', descriptionKey: 'plot_tools.templates.27_chapter_outline.ch15_16_desc' },
          { id: 'c27_ch17', titleKey: 'plot_tools.templates.27_chapter_outline.ch17', descriptionKey: 'plot_tools.templates.27_chapter_outline.ch17_desc' },
          { id: 'c27_ch18_21', titleKey: 'plot_tools.templates.27_chapter_outline.ch18_21', descriptionKey: 'plot_tools.templates.27_chapter_outline.ch18_21_desc' },
          { id: 'c27_ch22', titleKey: 'plot_tools.templates.27_chapter_outline.ch22', descriptionKey: 'plot_tools.templates.27_chapter_outline.ch22_desc' }
        ]
      },
      {
        titleKey: 'plot_tools.templates.27_chapter_outline.act3',
        steps: [
          { id: 'c27_ch23', titleKey: 'plot_tools.templates.27_chapter_outline.ch23', descriptionKey: 'plot_tools.templates.27_chapter_outline.ch23_desc' },
          { id: 'c27_ch24_26', titleKey: 'plot_tools.templates.27_chapter_outline.ch24_26', descriptionKey: 'plot_tools.templates.27_chapter_outline.ch24_26_desc' },
          { id: 'c27_ch27', titleKey: 'plot_tools.templates.27_chapter_outline.ch27', descriptionKey: 'plot_tools.templates.27_chapter_outline.ch27_desc' }
        ]
      }
    ]
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
