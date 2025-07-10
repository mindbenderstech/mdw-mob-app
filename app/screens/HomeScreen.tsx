import { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getAllArticles } from '../api/news'; // ✅ use your shared function
import { useRouter } from 'expo-router';

// Inside component:
const router = useRouter();

type Article = {
    id: number;
    title: string;
    image_path: string;
    article_date: string;
    unique_id_url: string;
};

export default function HomeScreen() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            const data = await getAllArticles('english'); // 👈 Change language if needed
            setArticles(data);
            setLoading(false);
        };
        fetch();
    }, []);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0066cc" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>📰 Trending News</Text>
            <FlatList
                data={articles}
                keyExtractor={(item) => item.unique_id_url}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() =>
                            router.push({
                                pathname: '/article/[language]/[id]',
                                params: {
                                    language: 'english', // later: make this dynamic
                                    id: item.unique_id_url,
                                },
                            })
                        }

                    >
                        <Image source={{ uri: item.image_path }} style={styles.image} />
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.date}>{item.article_date}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#fff' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    card: { flexDirection: 'row', marginBottom: 12, backgroundColor: '#f4f4f4', borderRadius: 8, overflow: 'hidden' },
    image: { width: 100, height: 80 },
    textContainer: { flex: 1, padding: 8 },
    title: { fontSize: 16, fontWeight: 'bold' },
    date: { fontSize: 12, color: 'gray' },
});
