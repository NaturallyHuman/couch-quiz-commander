import { Question } from '@/types/game';
import { supabase } from '@/integrations/supabase/client';

export const selectQuestions = async (category: string, count: number = 6, round: number = 1): Promise<Question[]> => {
  try {
    console.log('Fetching questions from API:', { category, count, round });
    
    const { data, error } = await supabase.functions.invoke('fetch-trivia', {
      body: { category, amount: count, round }
    });

    if (error) {
      console.error('Error fetching questions from API:', error);
      throw error;
    }

    if (!data || !data.questions || data.questions.length === 0) {
      console.error('No questions returned from API');
      throw new Error('No questions available');
    }

    console.log(`Successfully fetched ${data.questions.length} questions`);
    return data.questions as Question[];
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    throw error;
  }
};
