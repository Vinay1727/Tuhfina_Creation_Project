import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Product } from './types';

export const getProductsFromCSV = async (): Promise<Product[]> => {
    try {
        const filePath = path.join(process.cwd(), 'Dataset', 'Sheet1.csv');

        if (!fs.existsSync(filePath)) {
            console.error('CSV file not found at:', filePath);
            return [];
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');

        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });

        return records.map((record: any) => ({
            id: record.id || `prod_${Math.random().toString(36).substr(2, 9)}`,
            title: record.title,
            description: record.description,
            price: parseFloat(record.price) || 0,
            category: record.category,
            images: record.images ? [record.images] : [],
            isCustomizable: record.isCustomizable === 'TRUE' || record.isCustomizable === 'true' || record.isCustomizable === true,
            features: record.features ? record.features.split('|').map((f: string) => f.trim()) : [],
            createdAt: new Date(),
        }));
    } catch (error) {
        console.error('Error reading CSV:', error);
        return [];
    }
};
