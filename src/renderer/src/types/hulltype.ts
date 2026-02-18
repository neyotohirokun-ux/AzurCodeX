export interface HullType {
    id: number;
    name: string;
    short: string;
    position: string;
    icon: string;
    tech: string;
    title: string;
    label: {
        [key: string]: string;
    };
}