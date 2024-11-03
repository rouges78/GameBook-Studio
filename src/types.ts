export interface BookData {
  title: string;
  author: string;
  pages: PageData[];
}

export interface PageData {
  id: string;
  content: string;
  choices: ChoiceData[];
}

export interface ChoiceData {
  id: string;
  text: string;
  targetPageId: string;
}