import { Category, Class, Leaderboard, RaceResult } from "@/data/types";

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

export const calculateGeneralPoints = (invierno: Leaderboard, verano: Leaderboard) => {
    const combinedResults: Record<number, { driver: string; points: number }> = {};
  
    const mergeResults = (leaderboard: Leaderboard) => {
      leaderboard.classes.forEach((cls) => {
        cls.categories.forEach((category) => {
          category.results.forEach((result) => {
            if (!combinedResults[result.number]) {
              combinedResults[result.number] = {
                driver: result.driver,
                points: 0,
              };
            }
            combinedResults[result.number].points += result.points || 0;
          });
        });
      });
    };
  
    mergeResults(invierno);
    mergeResults(verano);
  
    return Object.values(combinedResults).sort((a, b) => b.points - a.points);
  };

  export const calculateGeneralPointsByCategory = (invierno: Leaderboard, verano: Leaderboard) => {
    const combinedResults: Record<string, Record<number, { driver: string; points: number }>> = {};
  
    const mergeResults = (leaderboard: Leaderboard) => {
      leaderboard.classes.forEach((cls) => {
        cls.categories.forEach((category) => {
          if (!combinedResults[category.name]) {
            combinedResults[category.name] = {};
          }
  
          category.results.forEach((result) => {
            if (!combinedResults[category.name][result.number]) {
              combinedResults[category.name][result.number] = {
                driver: result.driver,
                points: 0,
              };
            }
            combinedResults[category.name][result.number].points += result.points || 0;
          });
        });
      });
    };
  
    mergeResults(invierno);
    mergeResults(verano);
  
    // Ordenar por puntos dentro de cada categoría
    Object.keys(combinedResults).forEach((category) => {
      combinedResults[category] = Object.values(combinedResults[category]).sort(
        (a, b) => b.points - a.points
      );
    });
  
    return combinedResults;
  };

  export const mergeSeasonsIntoLeaderboard = (
    invierno: Leaderboard,
    verano: Leaderboard
  ): Leaderboard => {
    const combinedClasses: Record<string, Class> = {};
  
    const processSeason = (season: Leaderboard) => {
      season.classes.forEach((cls) => {
        // Asegurar que la clase existe en el combinado
        if (!combinedClasses[cls.title]) {
          combinedClasses[cls.title] = {
            title: cls.title,
            ageGroup: cls.ageGroup,
            details: cls.details,
            img: cls.img,
            categories: [],
          };
        }
  
        cls.categories.forEach((category) => {
          // Asegurar que la categoría existe en el combinado
          let combinedCategory = combinedClasses[cls.title].categories.find(
            (cat) => cat.name === category.name
          );
  
          if (!combinedCategory) {
            combinedCategory = { name: category.name, results: [] };
            combinedClasses[cls.title].categories.push(combinedCategory);
          }
  
          category.results.forEach((result) => {
            // Asegurar que el piloto existe en la categoría
            let combinedResult = combinedCategory.results.find(
              (res) => res.number === result.number
            );
  
            if (!combinedResult) {
              combinedResult = {
                driver: result.driver,
                number: result.number,
                team: result.team,
                country: result.country,
                points: 0,
                rank: 0,
                scores: [],
                worst: 0,
              };
              combinedCategory.results.push(combinedResult);
            }
  
            // Sumar puntos
            combinedResult.points = (combinedResult.points || 0) + (result.points || 0);
          });
        });
      });
    };
  
    // Procesar invierno y verano
    processSeason(verano);
    processSeason(invierno);
  
    // Ordenar resultados por puntos y asignar posiciones
    Object.values(combinedClasses).forEach((cls) => {
      cls.categories.forEach((category) => {
        category.results.sort((a, b) => (b.points || 0) - (a.points || 0));
        category.results.forEach((result, index) => {
          result.rank = index + 1;
        });
      });
    });
  
    // Crear el nuevo Leaderboard combinado
    return {
      year: invierno.year,
      season: "General",
      classes: Object.values(combinedClasses),
    };
  };



  export const generateGeneralLeaderboard = (leaderboard: {
    invierno: Leaderboard;
    verano: Leaderboard;
  }): Leaderboard => {
    const combinedClasses: Record<string, Class> = {};
  
    const processSeason = (season: Leaderboard) => {
      season.classes.forEach((cls) => {
        if (!combinedClasses[cls.title]) {
          combinedClasses[cls.title] = {
            title: cls.title,
            ageGroup: cls.ageGroup,
            details: cls.details,
            img: cls.img,
            categories: [],
          };
        }
  
        cls.categories.forEach((category) => {
          let combinedCategory = combinedClasses[cls.title].categories.find(
            (cat) => cat.name === category.name
          );
  
          if (!combinedCategory) {
            combinedCategory = { name: category.name, results: [] };
            combinedClasses[cls.title].categories.push(combinedCategory);
          }
  
          category.results.forEach((result) => {
            let combinedResult = combinedCategory.results.find(
              (res) => res.number === result.number
            );
  
            if (!combinedResult) {
              combinedResult = {
                driver: result.driver,
                number: result.number,
                team: result.team,
                country: result.country,
                points: 0,
                rank: 0,
                scores: [],
                worst: 0,
              };
              combinedCategory.results.push(combinedResult);
            }
  
            combinedResult.scores = [...combinedResult.scores, ...result.scores];
            combinedResult.points = combinedResult.scores.reduce((acc, score) => acc + score, 0);
          });
        });
      });
    };
  
    // Procesar las temporadas de invierno y verano
    processSeason(leaderboard.invierno);
    processSeason(leaderboard.verano);
  
    // Ordenar resultados por puntos y asignar posiciones
    Object.values(combinedClasses).forEach((cls) => {
      cls.categories.forEach((category) => {
        category.results.sort((a, b) => (b.points ||0) - (a.points||0));
        category.results.forEach((result, index) => {
          result.rank = index + 1;
        });
      });
    });
  
    // Crear el nuevo Leaderboard combinado
    return {
      year: leaderboard.invierno.year,
      season: "General",
      classes: Object.values(combinedClasses),
    };
  };


  export const addTeamsCategory = (leaderboard: Leaderboard): Leaderboard => {
    // Mantenemos un mapa para acumular puntos por equipo
    const teamPoints: Record<string, number> = {};

    // Iteramos sobre todas las clases y categorías
    leaderboard.classes.forEach((cls) => {
        cls.categories.forEach((category) => {
            category.results.forEach((result) => {
                if (result.team) {
                    // Ordenamos las puntuaciones de mayor a menor y tomamos los 3 mejores
                    const topScores = result.scores
                        .slice() // Copia para no modificar el array original
                        .sort((a, b) => b - a) // Orden descendente
                        .slice(0, 3); // Tomar los 3 mejores

                    const totalPoints = topScores.reduce((sum, score) => sum + score, 0);

                    teamPoints[result.team] = (teamPoints[result.team] || 0) + totalPoints;
                }
            });
        });
    });

    // Convertimos el mapa en una lista de resultados
    const teamResults = Object.entries(teamPoints).map(([team, points]) => ({
        driver: "", // No aplica para equipos
        number: 0, // No aplica para equipos
        team,
        country: "", // Opcional, no aplica para equipos
        points,
        rank: 0, // Se calculará después
        scores: [], // No se aplica para equipos
        worst: 0, // No aplica para equipos
    }));

    // Ordenamos los resultados por puntos y asignamos el rank
    teamResults.sort((a, b) => b.points - a.points).forEach((result, index) => {
        result.rank = index + 1;
    });

    // Creamos una nueva clase "Equipos"
    const teamsClass: Class = {
        title: "Equipos",
        ageGroup: "", // Opcional, se puede dejar vacío
        details: [], // Opcional, se puede dejar vacío
        img: "", // Opcional, se puede dejar vacío
        categories: [
            {
                name: "Equipos",
                results: teamResults,
            },
        ],
    };

    // Agregamos la nueva clase al leaderboard
    return {
        ...leaderboard,
        classes: [...leaderboard.classes, teamsClass],
    };
};
