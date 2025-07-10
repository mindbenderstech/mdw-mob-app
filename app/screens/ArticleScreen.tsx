import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getArticleByUniqueIdUrl } from '../api/news';

type Article = {
  title: string;
  image_path: string;
  article_date: string;
  article_detail: string;
};

export default function ArticleScreen() {
  const { id, language } = useLocalSearchParams(); // ✅ only here

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      if (typeof id === 'string' && typeof language === 'string') {
        const data = await getArticleByUniqueIdUrl(id, language);
        setArticle(data);
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id, language]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!article) {
    return (
      <View style={styles.center}>
        <Text>Article not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{article.title}</Text>
      <Image source={{ uri: article.image_path }} style={styles.image} />
      <Text style={styles.date}>{article.article_date}</Text>
      <Text style={styles.content}>{article.article_detail}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  image: { width: '100%', height: 200, borderRadius: 8, marginBottom: 10 },
  date: { color: 'gray', marginBottom: 10 },
  content: { fontSize: 16, lineHeight: 24 },
});
