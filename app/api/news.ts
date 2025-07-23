import axios from 'axios';

export const API_BASE_URL = 'https://api.theheadlineworld.com';

export const getLanguages = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/languages`);
    return response.data.languages || [];
  } catch (error) {
    console.error('Error fetching languages:', error);
    return [];
  }
};

export const getAllArticles = async (language = 'hindi') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/articles/all`, {
      params: { language },
    });
    return response.data.articles || [];
  } catch (error) {
    console.error('Error fetching all articles:', error);
    return [];
  }
};

export const getArticlesByCategory = async (language = 'hindi', category: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/articles/category/${category}`, {
      params: { language },
    });
    return response.data.articles || [];
  } catch (error) {
    console.error(`Error fetching ${category} articles:`, error);
    return [];
  }
};

export const getArticleByUniqueIdUrl = async (unique_id_url: string, language = 'hindi') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/articles/${unique_id_url}`, {
      params: { language },
    });
    return response.data.article;
  } catch (error) {
    console.error('Error fetching the article:', error);
    return null;
  }
};
