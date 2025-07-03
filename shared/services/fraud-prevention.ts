'use server';

import { supabaseAdmin } from '@/shared/utils/supabase/admin';

export interface UserTrustworthinessResult {
  isEligible: boolean;
  reason?: string;
  publishedCount: number;
  averageRating: number;
  isBypassUser: boolean;
}

export interface ContentQualityResult {
  isValid: boolean;
  score?: number;
  reason?: string;
  apiResponse?: any;
  usedFallback?: boolean;
}

export async function checkUserTrustworthiness(
  userId: string,
): Promise<UserTrustworthinessResult> {
  try {
    const bypassUserId = process.env.PREVENT_DEFAULT_ADD_MODEL_USER_ID;
    const bypassHypenatedUserId =
      process.env.PREVENT_DEFAULT_ADD_MODEL_HYPHENATED_USER_ID;
    if (
      (bypassHypenatedUserId || bypassUserId) &&
      (userId === bypassUserId || userId === bypassHypenatedUserId)
    ) {
      return {
        isEligible: true,
        isBypassUser: true,
        publishedCount: 0,
        averageRating: 0,
      };
    }

    const [promptsResult, agentsResult] = await Promise.all([
      supabaseAdmin
        .from('swarms_cloud_prompts')
        .select('id, created_at')
        .eq('user_id', userId),
      supabaseAdmin
        .from('swarms_cloud_agents')
        .select('id, created_at')
        .eq('user_id', userId),
    ]);

    if (promptsResult.error || agentsResult.error) {
      throw new Error('Failed to fetch user content');
    }

    const prompts = promptsResult.data || [];
    const agents = agentsResult.data || [];
    const allItemIds = [
      ...prompts.map((p) => p.id),
      ...agents.map((a) => a.id),
    ];

    if (allItemIds.length === 0) {
      return {
        isEligible: false,
        reason: 'You need to have created content before listing on marketplace.',
        publishedCount: 0,
        averageRating: 0,
        isBypassUser: false,
      };
    }

    const ratingsResult = await supabaseAdmin
      .from('swarms_cloud_reviews')
      .select('rating, model_id, model_type')
      .in('model_id', allItemIds)
      .neq('user_id', userId);

    if (ratingsResult.error) {
      throw new Error('Failed to fetch ratings');
    }

    const ratings = ratingsResult.data || [];

    const highQualityRatings = ratings.filter(review =>
      review.rating !== null &&
      review.rating !== undefined &&
      review.rating >= 4
    );

    // Get unique items that have 4+ ratings
    const itemsWithHighRatings = new Set(
      highQualityRatings.map(review => review.model_id)
    );

    const qualityItemsCount = itemsWithHighRatings.size;

    if (qualityItemsCount < 2) {
      return {
        isEligible: false,
        reason: `To create paid content, you need at least 2 items with ratings of 4+ stars from other users. You currently have ${qualityItemsCount} highly-rated items. Keep creating quality free content to build your reputation!`,
        publishedCount: allItemIds.length,
        averageRating: ratings.length > 0 ? ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length : 0,
        isBypassUser: false,
      };
    }

    const totalRating = ratings.reduce(
      (sum, review) => sum + (review?.rating || 0),
      0,
    );
    const averageRating = ratings.length > 0 ? totalRating / ratings.length : 0;

    return {
      isEligible: true,
      publishedCount: allItemIds.length,
      averageRating,
      isBypassUser: false,
    };
  } catch (error) {
    console.error('Error checking user trustworthiness:', error);
    return {
      isEligible: false,
      reason: 'Unable to verify eligibility. Please try again.',
      publishedCount: 0,
      averageRating: 0,
      isBypassUser: false,
    };
  }
}

export async function validateContentFallback(
  userId: string,
  isFree: boolean = false
): Promise<ContentQualityResult> {
  try {
    const [promptsResult, agentsResult] = await Promise.all([
      supabaseAdmin
        .from('swarms_cloud_prompts')
        .select('id, created_at')
        .eq('user_id', userId),
      supabaseAdmin
        .from('swarms_cloud_agents')
        .select('id, created_at')
        .eq('user_id', userId),
    ]);

    if (promptsResult.error || agentsResult.error) {
      throw new Error('Failed to fetch user content history');
    }

    const prompts = promptsResult.data || [];
    const agents = agentsResult.data || [];
    const allItemIds = [
      ...prompts.map(p => p.id),
      ...agents.map(a => a.id),
    ];

    if (allItemIds.length === 0) {
      return {
        isValid: false,
        reason: 'Fallback validation: You need to have created content before submitting. Quality validation service is temporarily unavailable.',
        usedFallback: true,
      };
    }

    if (isFree) {
      if (allItemIds.length < 1) {
        return {
          isValid: false,
          reason: 'Our validation system is temporarily down. Since this is your first submission, please try again in a few minutes when the system is back online.',
          usedFallback: true,
        };
      }

      return {
        isValid: true,
        reason: 'Content approved based on your submission history. Our validation system will be back online shortly.',
        usedFallback: true,
      };
    }

    const ratingsResult = await supabaseAdmin
      .from('swarms_cloud_reviews')
      .select('rating, model_id, model_type')
      .in('model_id', allItemIds)
      .neq('user_id', userId);

    if (ratingsResult.error) {
      throw new Error('Failed to fetch ratings for fallback validation');
    }

    const ratings = ratingsResult.data || [];

    const highQualityRatings = ratings.filter(review =>
      review.rating !== null &&
      review.rating !== undefined &&
      review.rating >= 4
    );

    // Get unique items that have 4+ ratings
    const itemsWithHighRatings = new Set(
      highQualityRatings.map(review => review.model_id)
    );

    const qualityItemsCount = itemsWithHighRatings.size;

    if (qualityItemsCount < 2) {
      return {
        isValid: false,
        reason: `To create paid content, you need at least 2 items with 4+ star ratings. You currently have ${qualityItemsCount} highly-rated items. Our validation system is temporarily down - please try again later.`,
        usedFallback: true,
      };
    }

    const totalRating = ratings.reduce((sum, review) => sum + (review.rating || 0), 0);
    const averageRating = ratings.length > 0 ? totalRating / ratings.length : 0;

    return {
      isValid: true,
      reason: `Fallback validation: Content approved based on your quality history (${qualityItemsCount} items with 4+ ratings, ${averageRating.toFixed(1)} avg rating).`,
      usedFallback: true,
    };

  } catch (error) {
    console.error('Error in fallback validation:', error);

    return {
      isValid: false,
      reason: 'Our validation system is experiencing issues. Please try submitting your content again in a few minutes.',
      usedFallback: true,
    };
  }
}

export async function validateContentQuality(
  content: string,
  type: 'prompt' | 'agent',
  name: string,
  description: string,
  isFree: boolean = false,
  userId?: string,
): Promise<ContentQualityResult> {
  try {
    const apiKey = process.env.DEFAULT_API_KEY;
    if (!apiKey) {
      throw new Error('API key not configured');
    }

    if (process.env.TEST_API_FAILURE === 'true') {
      throw new Error('Simulated API failure for testing');
    }

    const minScore = isFree ? 5 : 8;
    const qualityLevel = isFree ? 'medium' : 'high';

    const validationPrompt =
      type === 'prompt'
        ? `Evaluate this prompt for ${qualityLevel} quality standards for a marketplace:

Title: ${name}
Description: ${description}
Prompt Content: ${content}

Rate this prompt on a scale of 1-10 considering:
1. Clarity and specificity - Is the prompt clear and well-defined?
2. Usefulness and practical value - Does it serve a real purpose?
3. Appropriateness - No harmful, illegal, or inappropriate content
4. Originality and creativity - Is it unique and thoughtful?
5. Technical quality - Is it well-structured and actionable?

${isFree ? 'This is a FREE prompt submission - apply basic quality standards.' : 'This is a PAID prompt submission - apply strict quality standards.'}

Respond with ONLY a number (1-10) followed by a dash and brief constructive feedback. Example: "7 - Good clarity but could be more specific about the desired output format."`
        : `Evaluate this agent for ${qualityLevel} quality standards for a marketplace:

Title: ${name}
Description: ${description}
Agent Configuration/Code: ${content}

Rate this agent on a scale of 1-10 considering:
1. Code quality and structure - Is the code well-organized and readable?
2. Functionality and usefulness - Does it solve a real problem effectively?
3. Security and safety - No malicious code or security vulnerabilities
4. Documentation and clarity - Is the purpose and usage clear?
5. Practical value - Is it genuinely useful for users?

${isFree ? 'This is a FREE agent submission - apply basic quality standards.' : 'This is a PAID agent submission - apply strict quality standards.'}

Respond with ONLY a number (1-10) followed by a dash and brief constructive feedback. Example: "8 - Well-structured agent with clear purpose, but could benefit from better error handling."`;

    const response = await fetch(
      'https://api.swarms.world/v1/agent/completions',
      {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agent_config: {
            agent_name: 'Quality Validator',
            description: 'Validates content quality for marketplace',
            system_prompt:
              'You are a quality validator for a marketplace. Evaluate content objectively and provide scores with brief explanations.',
            model_name: 'claude-3-5-sonnet-20240620',
            temperature: 0.1,
            max_tokens: 150,
            auto_generate_prompt: false,
          },
          task: validationPrompt,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const apiResult = await response.json();

    let apiResponse = '';
    if (apiResult.outputs && apiResult.outputs.length > 0) {
      apiResponse = apiResult.outputs[0].content || '';
    } else {
      apiResponse = apiResult.response || apiResult.content || '';
    }

    const scoreMatch = apiResponse.match(/^(\d+(?:\.\d+)?)\s*[-–—]\s*(.+)/);
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : 0;
    const feedback = scoreMatch ? scoreMatch[2].trim() : apiResponse;

    const isValid = score >= minScore;

    return {
      isValid,
      score,
      reason: isValid
        ? 'Content meets quality standards'
        : `Your ${type} needs improvement to meet our quality standards. Score: ${score}/10 (minimum: ${minScore}/10). ${feedback}`,
      apiResponse: feedback,
    };
  } catch (error) {
    console.error('Error validating content quality:', error);

    if (userId) {
      return await validateContentFallback(userId, isFree);
    }

    return {
      isValid: false,
      reason: 'Our quality validation system is temporarily unavailable. Please try submitting again in a few minutes.',
      apiResponse: error instanceof Error ? error.message : 'Unknown error',
      usedFallback: true,
    };
  }
}

export async function validateMarketplaceSubmission(
  userId: string,
  content: string,
  type: 'prompt' | 'agent',
  name: string,
  description: string,
  isFree: boolean = false,
): Promise<{
  isValid: boolean;
  trustworthiness: UserTrustworthinessResult;
  contentQuality: ContentQualityResult;
  errors: string[];
}> {
  let trustworthiness: UserTrustworthinessResult;
  let contentQuality: ContentQualityResult;

  if (isFree) {
    trustworthiness = {
      isEligible: true,
      publishedCount: 0,
      averageRating: 0,
      isBypassUser: false,
    };
    contentQuality = await validateContentQuality(content, type, name, description, isFree, userId);
  } else {
    const [trustResult, qualityResult] = await Promise.all([
      checkUserTrustworthiness(userId),
      validateContentQuality(content, type, name, description, isFree, userId),
    ]);
    trustworthiness = trustResult;
    contentQuality = qualityResult;
  }

  const errors: string[] = [];

  if (!trustworthiness.isEligible) {
    errors.push(trustworthiness.reason || 'User not eligible');
  }

  if (!contentQuality.isValid) {
    errors.push(contentQuality.reason || 'Content quality insufficient');
  }

  return {
    isValid: trustworthiness.isEligible && contentQuality.isValid,
    trustworthiness,
    contentQuality,
    errors,
  };
}
