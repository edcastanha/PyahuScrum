import { storageService } from '../storage/storageService';

export interface ADR {
  id: number;
  projectId: string; // Adicionado para vincular ao projeto
  title: string;
  status: 'proposed' | 'accepted' | 'rejected' | 'deprecated' | 'superseded';
  date: string;
  content: string;
}

class DocumentationService {
  private readonly STORAGE_KEY_README = 'project_readme_';
  private readonly STORAGE_KEY_ADRS = 'project_adrs_';

  // README
  saveReadme(projectId: string, content: string): void {
    storageService.setItem(`${this.STORAGE_KEY_README}${projectId}`, content);
  }

  getReadme(projectId: string): string {
    return storageService.getItem(`${this.STORAGE_KEY_README}${projectId}`) || '';
  }

  // ADRs
  saveADR(projectId: string, adr: Omit<ADR, 'id'> & { id?: number }): ADR {
    const adrs = this.getADRs(projectId);

    if (adr.id) {
      const index = adrs.findIndex(a => a.id === adr.id);
      if (index !== -1) {
        // Lógica de atualização
        const updatedADR = { ...adrs[index], ...adr, id: adr.id };
        adrs[index] = updatedADR;
        this.saveADRs(projectId, adrs);
        return updatedADR;
      }
    }
    
    // Lógica de criação
    const newADR: ADR = {
      ...adr,
      id: this.generateADRId(adrs),
    };
    adrs.push(newADR);
    this.saveADRs(projectId, adrs);
    return newADR;
  }

  deleteADR(projectId: string, adrId: number): void {
    const adrs = this.getADRs(projectId);
    const filteredADRs = adrs.filter(adr => adr.id !== adrId);
    this.saveADRs(projectId, filteredADRs);
  }

  getADRs(projectId: string): ADR[] {
    return storageService.getItem<ADR[]>(`${this.STORAGE_KEY_ADRS}${projectId}`) || [];
  }

  private saveADRs(projectId: string, adrs: ADR[]): void {
    storageService.setItem(`${this.STORAGE_KEY_ADRS}${projectId}`, adrs);
  }

  private generateADRId(adrs: ADR[]): number {
    if (adrs.length === 0) return 1;
    return Math.max(...adrs.map(adr => adr.id)) + 1;
  }
}

export const documentationService = new DocumentationService();
