import { Category, Class, RaceResult } from "@/data/types";

export function calculatePointsAndSort(classes: Class[]) {
    classes.forEach((classItem: Class) => {
        classItem.categories.forEach((category: Category) => {
            category.results.forEach((result: RaceResult) => {
                result.points = result.scores.reduce((sum, score) => sum + score, 0);
            });

            category.results.sort(
                (a, b) => (b.points! - b.worst) - (a.points! - a.worst)
            );

            category.results.forEach((result, index) => {
                result.rank = index + 1;
            });
        });
    });
}