export interface Project {
  id: string;
  name: string;
  description: string;
  // status e progress removidos (E3-T10 / ticket #27):
  // o status passa a ser derivado do pipeline (ProjectStatus no Firestore)
  // e não é mais um campo manual do projeto.
}
