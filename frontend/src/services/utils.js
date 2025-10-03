import { db } from '../firebase';
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { startOfDay, endOfDay } from 'date-fns';

export const fetchDataFromCollection = async (collectionName, startDate, endDate, filterField, filterValue) => {
    const collectionRef = collection(db, collectionName);
    let q = query(collectionRef);

    if (filterField && filterValue) {
        q = query(q, where(filterField, "==", filterValue));
    }

    if (startDate && endDate) {
        q = query(q,
            where("date", ">=", Timestamp.fromDate(startOfDay(startDate))),
            where("date", "<=", Timestamp.fromDate(endOfDay(endDate)))
        );
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, date: doc.data().date.toDate() }));
};