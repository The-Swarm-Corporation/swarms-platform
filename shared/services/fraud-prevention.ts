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
  console.log('checkUserTrustworthiness', userId);
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
        .eq('user_id', userId)
        .eq('status', 'approved'),
      supabaseAdmin
        .from('swarms_cloud_agents')
        .select('id, created_at')
        .eq('user_id', userId)
        .eq('status', 'approved'),
    ]);

    if (promptsResult.error || agentsResult.error) {
      throw new Error('Failed to fetch user content');
    }

    const prompts = promptsResult.data || [];
    const agents = agentsResult.data || [];
    const totalPublished = prompts.length + agents.length;

    if (totalPublished < 2) {
      return {
        isEligible: false,
        reason: `You need at least 2 published items to list on marketplace. You have ${totalPublished}.`,
        publishedCount: totalPublished,
        averageRating: 0,
        isBypassUser: false,
      };
    }

    const allItemIds = [
      ...prompts.map((p) => p.id),
      ...agents.map((a) => a.id),
    ];

    const ratingsResult = await supabaseAdmin
      .from('swarms_cloud_reviews')
      .select('rating, model_id')
      .in('model_id', allItemIds)
      .neq('user_id', userId);

    if (ratingsResult.error) {
      throw new Error('Failed to fetch ratings');
    }

    const ratings = ratingsResult.data || [];

    if (ratings.length === 0) {
      return {
        isEligible: false,
        reason:
          'Your published items need at least one rating from other users to be eligible for marketplace listing.',
        publishedCount: totalPublished,
        averageRating: 0,
        isBypassUser: false,
      };
    }

    const totalRating = ratings.reduce(
      (sum, review) => sum + (review?.rating || 0),
      0,
    );
    const averageRating = totalRating / ratings.length;

    if (averageRating < 3.5) {
      return {
        isEligible: false,
        reason: `Your average rating (${averageRating.toFixed(1)}) must be at least 3.5 to list on marketplace.`,
        publishedCount: totalPublished,
        averageRating,
        isBypassUser: false,
      };
    }

    return {
      isEligible: true,
      publishedCount: totalPublished,
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
        .eq('user_id', userId)
        .eq('status', 'approved'),
      supabaseAdmin
        .from('swarms_cloud_agents')
        .select('id, created_at')
        .eq('user_id', userId)
        .eq('status', 'approved'),
    ]);

    if (promptsResult.error || agentsResult.error) {
      throw new Error('Failed to fetch user content history');
    }

    const prompts = promptsResult.data || [];
    const agents = agentsResult.data || [];
    const totalApproved = prompts.length + agents.length;

    if (totalApproved < 2) {
      return {
        isValid: false,
        reason: `Fallback validation: You need at least 2 approved submissions to continue. You have ${totalApproved}. Quality validation service is temporarily unavailable.`,
        usedFallback: true,
      };
    }

    if (isFree) {
      return {
        isValid: true,
        reason: 'Fallback validation: Content approved based on your history of quality submissions.',
        usedFallback: true,
      };
    }

    const allItemIds = [
      ...prompts.map(p => p.id),
      ...agents.map(a => a.id),
    ];

    const ratingsResult = await supabaseAdmin
      .from('swarms_cloud_reviews')
      .select('rating, model_id')
      .in('model_id', allItemIds)
      .neq('user_id', userId);

    if (ratingsResult.error) {
      throw new Error('Failed to fetch ratings for fallback validation');
    }

    const ratings = ratingsResult.data || [];

    if (ratings.length === 0) {
      return {
        isValid: false,
        reason: 'Fallback validation: Your approved items need at least one rating from other users for paid submissions. Quality validation service is temporarily unavailable.',
        usedFallback: true,
      };
    }

    const validRatings = ratings.filter(review => review.rating !== null && review.rating !== undefined);

    if (validRatings.length === 0) {
      return {
        isValid: false,
        reason: 'Fallback validation: Your approved items need valid ratings from other users for paid submissions. Quality validation service is temporarily unavailable.',
        usedFallback: true,
      };
    }

    const totalRating = validRatings.reduce((sum, review) => sum + (review.rating || 0), 0);
    const averageRating = totalRating / validRatings.length;

    if (averageRating < 3.5) {
      return {
        isValid: false,
        reason: `Fallback validation: Your average rating (${averageRating.toFixed(1)}) must be at least 3.5 for paid submissions. Quality validation service is temporarily unavailable.`,
        usedFallback: true,
      };
    }

    return {
      isValid: true,
      reason: `Fallback validation: Content approved based on your quality history (${totalApproved} approved items, ${averageRating.toFixed(1)} avg rating).`,
      usedFallback: true,
    };

  } catch (error) {
    console.error('Error in fallback validation:', error);

    return {
      isValid: false,
      reason: 'Unable to validate content quality. Both primary and fallback validation systems are unavailable. Please try again later.',
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

    const minScore = isFree ? 4 : 6;
    const qualityLevel = isFree ? 'basic' : 'high';

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
            model_name: 'gpt-4o',
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

    const result = await response.json();

    let apiResponse = '';
    if (result.outputs && result.outputs.length > 0) {
      apiResponse = result.outputs[0].content || '';
    } else {
      apiResponse = result.response || result.content || '';
    }

    console.log('API Response:', { result, apiResponse });

    const scoreMatch = apiResponse.match(/^(\d+(?:\.\d+)?)\s*[-–—]\s*(.+)/);
    const score = scoreMatch ? parseFloat(scoreMatch[1]) : 0;
    const feedback = scoreMatch ? scoreMatch[2].trim() : apiResponse;

    const isValid = score >= minScore;

    return {
      isValid,
      score,
      reason: isValid
        ? 'Content meets quality standards'
        : `Content quality score (${score}/10) is below minimum requirement (${minScore}/10). Feedback: ${feedback}`,
      apiResponse: feedback,
    };
  } catch (error) {
    console.error('Error validating content quality:', error);

    if (userId) {
      console.log('API failed, using fallback validation for user:', userId);
      return await validateContentFallback(userId, isFree);
    }

    return {
      isValid: false,
      reason: 'Quality validation service is temporarily unavailable and user history cannot be verified. Please try again later.',
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
