import { collection, addDoc, getDoc, getDocs, query, where, doc, setDoc } from 'firebase/firestore';
import { db } from '../scripts/firebase.js';

export const loadCollection = async (collectionName) => {
    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        const items = [];
        querySnapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
        });
        return items; 
    } catch (error) {
        console.error('Error reading documents: ', error);
        throw new Error('Error reading documents from Firestore');
    }
};

export const addToCollection = async (collectionName, data) => {
    try {
        const docRef = await addDoc(collection(db, collectionName), data);
        console.log('Document added with ID: ', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Error adding document: ', error);
        throw new Error('Error adding document to Firestore');
    }
};

export const searchCollectionForDoc = async (collectionName, key, value) => {
    try {
        const collectionRef = collection(db, collectionName);
        let queryRef;

        if (key === 'id') {
            queryRef = await getDoc(doc(collectionRef, value));
            if (queryRef.exists()) {
                return [{ id: queryRef.id, ...queryRef.data() }];
            } else {
                return [];
            }
        } else {
            queryRef = await getDocs(query(collectionRef, where(key, '==', value)));
            const items = queryRef.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return items;
        }
    } catch (error) {
        console.error('Error searching documents: ', error);
        throw new Error('Error searching documents in Firestore');
    }
};

export const setDocData = async (collectionName, searchKey, searchValue, newData) => {
    try {
        const searchResults = await searchCollectionForDoc(collectionName, searchKey, searchValue);

        if (searchResults.length === 0) {
            console.error('Document not found for search key-value pair:', searchKey, searchValue);
            throw new Error('Document not found in Firestore');
        }

        const docId = searchResults[0].id;
 
        const docRef = doc(db, collectionName, docId);
        await setDoc(docRef, newData, { merge: true });

        console.log('Document updated with ID:', docId);
        return docId;
    } catch (error) {
        console.error('Error updating document:', error);
        throw new Error('Error updating document in Firestore');
    }
};