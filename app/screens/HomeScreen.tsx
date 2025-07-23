import { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getAllArticles, getArticlesByCategory } from '../api/news';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useLanguage } from '../context/LanguageContext';

type Article = {
  id: number;
  title: string;
  image_path: string;
  article_date: string;
  unique_id_url: string;
  slug: string;
  news_source_url: string;
};

export default function HomeScreen() {
  const router = useRouter();
  const { language, setLanguage, availableLanguages } = useLanguage();

  const [trending, setTrending] = useState<Article[]>([]);
  const [sports, setSports] = useState<Article[]>([]);
  const [crime, setCrime] = useState<Article[]>([]);
  const [entertainment, setEntertainment] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      const lang = language;

      if (category) {
        const data = await getArticlesByCategory(lang, category);
        setTrending(data);
      } else {

        const [all, s, c, e] = await Promise.all([
          getAllArticles(lang),
          getArticlesByCategory(lang, 'sports'),
          getArticlesByCategory(lang, 'crime'),
          getArticlesByCategory(lang, 'entertainment'),
        ]);
        setTrending(all);
        setSports(s);
        setCrime(c);
        setEntertainment(e);
      }

      setLoading(false);
    };

    fetchArticles();
  }, [language, category]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  const renderFirstArticle = (item: Article, styleOverride?: object) => (
    <TouchableOpacity
      style={[styles.firstArticleCard, styleOverride]}
      onPress={() =>
        router.push({
          pathname: '/article/[language]/[id]',
          params: { language: language, id: item.unique_id_url },
        })
      }
    >
      <Image source={{ uri: item.image_path }} style={styles.firstImage} />
      <Text style={styles.firstArticleDate}>{item.article_date}</Text>
      <Text style={styles.firstArticleTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderArticleGrid = (items: Article[], isCategorySelected: boolean) => {
    const dataToRender = isCategorySelected ? items : items.slice(1, 6);

    return (
      <FlatList
        data={dataToRender}
        keyExtractor={(item) => item.unique_id_url}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.articleCard}
            onPress={() =>
              router.push({
                pathname: '/article/[language]/[id]',
                params: { language: language, id: item.unique_id_url },
              })
            }
          >
            <Image source={{ uri: item.image_path }} style={styles.articleImage} />
            <View style={styles.articleTextContainer}>
              <Text style={styles.articleTitle}>{item.title}</Text>
              <Text style={styles.articleDate}>{item.article_date}</Text>
            </View>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={styles.container}>

      <View style={styles.headerContainer}>
        <Text style={styles.header}>The Headline World</Text>
      </View>

      <View style={styles.dropdownContainer}>
        <Picker
          selectedValue={category}
          onValueChange={(itemValue) => setCategory(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Home" value="" />
          <Picker.Item label="Business" value="business" />
          <Picker.Item label="Sports" value="sports" />
          <Picker.Item label="Crime" value="crime" />
          <Picker.Item label="Entertainment" value="entertainment" />
          <Picker.Item label="Politics" value="politics" />
          <Picker.Item label="Spiritual" value="astro" />
        </Picker>

        <Picker
          selectedValue={language}
          onValueChange={(itemValue) => setLanguage(itemValue)}
          style={styles.picker}
        >
          {availableLanguages.map((lang) => (
            <Picker.Item key={lang} label={lang.charAt(0).toUpperCase() + lang.slice(1)} value={lang} />
          ))}
        </Picker>
      </View>

      <FlatList
        data={category ? trending : []}
        ListHeaderComponent={() => {
          return (
            <>
              {category === "" && (
                <>
                  {renderFirstArticle(trending[0])}
                  {renderArticleGrid(trending, false)}

                  <Text style={styles.sectionHeader}>Sports News</Text>
                  {renderFirstArticle(sports[0])}
                  {renderArticleGrid(sports, false)}

                  <Text style={styles.sectionHeader}>Crime News</Text>
                  {renderFirstArticle(crime[0])}
                  {renderArticleGrid(crime, false)}

                  <Text style={styles.sectionHeader}>Entertainment News</Text>
                  {renderFirstArticle(entertainment[0])}
                  {renderArticleGrid(entertainment, false)}
                </>
              )}

              {category && renderArticleGrid(trending, true)}
            </>
          );
        }}
        renderItem={null}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    padding: 10,
    paddingTop: 40,
    backgroundColor: '#fff',
    zIndex: 10,
    alignItems: 'center',
  },
  header: { fontSize: 24, fontWeight: 'bold' },
  sectionHeader: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },

  // Dropdown styles
  dropdownContainer: {
    marginTop: 80,
    marginBottom: 20,
    paddingHorizontal: 15,
    flexDirection: 'row',  // Align dropdowns horizontally
    justifyContent: 'space-between',  // Space between dropdowns
  },
  picker: {
    height: 50,
    width: '45%',  // Make each dropdown take up half of the screen width
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: '#f4f4f4',
    marginVertical: 10,
  },

  firstArticleCard: {
    marginBottom: 20,
    padding: 5,
    backgroundColor: '#f4f4f4',
    borderRadius: 20,
    overflow: 'hidden',
    paddingBottom: 15,
  },
  firstImage: { width: '100%', height: 240, borderRadius: 20 },
  firstArticleDate: { fontSize: 14, color: 'gray', marginTop: 10, marginBottom: 5, paddingLeft: 10 },
  firstArticleTitle: { fontSize: 18, fontWeight: 'bold', paddingLeft: 10, paddingBottom: 10 },

  articleCard: { flexDirection: 'row', marginBottom: 12, backgroundColor: '#f4f4f4', borderRadius: 8, overflow: 'hidden' },
  articleImage: { width: 100, height: 80 },
  articleTextContainer: { flex: 1, padding: 8 },
  articleTitle: { fontSize: 16, fontWeight: 'bold' },
  articleDate: { fontSize: 12, color: 'gray' },
});
