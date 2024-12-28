export interface Driver {
    id: number;
    documentId: string;
    Name: string;
    age: number | null;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    bio: string | null;
    dob: string | null;
  }
  
  export interface Category {
    id: number;
    documentId: string;
    name: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  }

  export interface Race {
    id: number;
    name: string;
    date: string;
  }

  export interface Category {
    id: number;
    name: string;
  }
  

  export interface Season {
    id: number;
    name: string;
  }
  
  export interface Race {
    id: number;
    position: number | null;
    points: number | null;
    r1: number | null;
    r2: number | null;
    r3: number | null;
    participate: boolean | null;
    category: Category;
    driver: Driver;
  }
  
  export interface ApiResponse {
    data: Race[];
    meta: {
      pagination: {
        page: number;
        pageSize: number;
        pageCount: number;
        total: number;
      };
    };
  }