import { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity, Animated, Modal, ScrollView } from 'react-native';
import { getAllArticles, getArticlesByCategory } from '../api/news';
import { useRouter } from 'expo-router';
import { useLanguage } from '../context/LanguageContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isLanguageModalVisible, setLanguageModalVisible] = useState(false);

  // Animated value for the sidebar
  const sidebarAnim = useRef(new Animated.Value(-300)).current; // Initial position offscreen (to the left)

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

  // Function to open the category sidebar
  const openCategorySidebar = () => {
    Animated.timing(sidebarAnim, {
      toValue: 0, // Move the sidebar to its original position
      duration: 300,
      useNativeDriver: true,
    }).start();
    setCategoryModalVisible(true);
  };

  // Function to close the category sidebar
  const closeCategorySidebar = () => {
    Animated.timing(sidebarAnim, {
      toValue: -300, // Move the sidebar offscreen
      duration: 300,
      useNativeDriver: true,
    }).start();
    setCategoryModalVisible(false);
  };

  // Function to open the language sidebar from left to right
  const openLanguageSidebar = () => {
    Animated.timing(sidebarAnim, {
      toValue: 0, // Move the sidebar to its original position (from left)
      duration: 300,
      useNativeDriver: true,
    }).start();
    setLanguageModalVisible(true);
  };

  // Function to close the language sidebar
  const closeLanguageSidebar = () => {
    Animated.timing(sidebarAnim, {
      toValue: -300, // Move the sidebar offscreen (to the left)
      duration: 300,
      useNativeDriver: true,
    }).start();
    setLanguageModalVisible(false);
  };

  return (
    <View style={styles.container}>

      <View style={styles.headerContainer}>
        <Text style={styles.header}>The Headline World</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.searchButton} onPress={() => console.log('Search Pressed')}>
            <Icon name="search" size={30} color="#3955e6ff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.loginButton} onPress={() => console.log('Login Pressed')}>
            <Icon name="account-circle" size={30} color="#3955e6ff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.dropdownContainer}>
        {/* Scrollable Buttons for Home, Categories, and Language */}
        <ScrollView horizontal={true} style={styles.scrollContainer}>
          {/* Home Button */}
          <TouchableOpacity style={styles.pickerContainer} onPress={() => setCategory('')}>
            <Text style={styles.pickerText}>Home</Text>
          </TouchableOpacity>

          {/* Categories Button */}
          <TouchableOpacity
            style={styles.pickerContainer}
            onPress={openCategorySidebar}
          >
            <Text style={styles.pickerText}>Categories</Text>
          </TouchableOpacity>

          {/* Language Button */}
          <TouchableOpacity
            style={styles.pickerContainer}
            onPress={openLanguageSidebar} // Open language sidebar
          >
            <Text style={styles.pickerText}>Language</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={category ? trending : []}
        ListHeaderComponent={() => {
          return (
            <>
              {category === '' && (
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

      {/* Categories Sidebar */}
      {isCategoryModalVisible && (
        <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}>
          <TouchableOpacity style={styles.closeButton} onPress={closeCategorySidebar}>
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <FlatList
            data={['business', 'sports', 'crime', 'entertainment', 'politics']}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setCategory(item);
                  closeCategorySidebar();
                }}
              >
                <Text style={styles.modalItemText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      )}

      {/* Language Sidebar */}
      {isLanguageModalVisible && (
        <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}>
          <TouchableOpacity style={styles.closeButton} onPress={closeLanguageSidebar}>
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <FlatList
            data={availableLanguages}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setLanguage(item);
                  closeLanguageSidebar();
                }}
              >
                <Text style={styles.modalItemText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
    paddingTop: 40,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  header: { fontSize: 24, fontWeight: 'bold' },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButton: {
    backgroundColor: 'transparent',
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 20,
    marginRight: 10,
    borderColor: '#3955e6ff',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  loginButton: {
    backgroundColor: 'transparent',
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 20,
    borderColor: '#3955e6ff',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionHeader: { fontSize: 20, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },

  dropdownContainer: {
    marginBottom: 5,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  scrollContainer: {
    marginBottom: 10,
    paddingVertical: 5,
  },
  pickerContainer: {
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#3955e6ff',
    borderRadius: 20,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 140,
  },
  pickerText: {
    fontSize: 16,
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

  sidebar: {
    position: 'absolute',
    left: 0,
    top: 80,
    bottom: 0,
    width: '50%',
    backgroundColor: '#a3b4a1ff',
    paddingTop: 100,
    paddingHorizontal: 0,
    zIndex: 20,
    borderRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 10,
  },
  modalItem: {
    padding: 15,
    marginLeft: 20,
    marginBottom: 10,
    backgroundColor: '#f4f4f4',
    borderRadius: 5,
    width: '80%',
  },
  modalItemText: { fontSize: 16 },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
});
