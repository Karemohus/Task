import { useState, useEffect } from 'react';

const SITE_TITLE_STORAGE_KEY = 'todoAppSiteTitle';
const DEFAULT_TITLE = 'Modern To-Do';

const getInitialTitle = (): string => {
    try {
        const item = window.localStorage.getItem(SITE_TITLE_STORAGE_KEY);
        return item ? JSON.parse(item) : DEFAULT_TITLE;
    } catch (error) {
        console.error('Error reading site title from localStorage', error);
        return DEFAULT_TITLE;
    }
};

export const useSiteTitle = () => {
    const [title, setTitle] = useState<string>(getInitialTitle);

    useEffect(() => {
        document.title = title;
        try {
            window.localStorage.setItem(SITE_TITLE_STORAGE_KEY, JSON.stringify(title));
        } catch (error) {
            console.error('Error saving site title to localStorage', error);
        }
    }, [title]);

    return { title, setTitle };
};
