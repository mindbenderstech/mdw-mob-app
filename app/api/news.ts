import axios from 'axios';

export const API_BASE_URL = 'https://api.headliness.com'; // ✅ Your live Flask API

export const getLanguages = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/languages`);
    return response.data.languages || [];
  } catch (error) {
    console.error('Error fetching languages:', error);
    return [];
  }
};

export const getAllArticles = async (language = 'marathi') => {
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

export const getArticleByUniqueIdUrl = async (unique_id_url: string, language = 'marathi') => {
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
