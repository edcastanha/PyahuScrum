export interface Project {
  id: string;
  name: string;
  description: string;
  /** ID do documento no Firestore após envio ao pipeline (undefined = ainda não enviado). */
  pipelineId?: string;
}
