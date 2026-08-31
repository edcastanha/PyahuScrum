/**
 * ElicitacaoRound.test.tsx — TDD E3-T13 (ticket #30)
 *
 * Testa o container da rodada (cards + botão enviar + botão gerar agora).
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ElicitacaoRound from './ElicitacaoRound';

const PERGUNTAS = [
  {
    id: 'q1',
    texto: 'Qual a stack de backend?',
    opcoes: ['Python', 'Node'],
    permite_texto: true,
  },
  {
    id: 'q2',
    texto: 'Qual o público-alvo?',
    opcoes: ['B2B', 'B2C'],
    permite_texto: false,
  },
];

describe('ElicitacaoRound', () => {
  describe('botão Enviar respostas', () => {
    it('está desabilitado quando nenhum card está respondido', () => {
      render(
        <ElicitacaoRound
          perguntas={PERGUNTAS}
          rodada={1}
          projectId="proj-1"
          onEnviado={jest.fn()}
        />
      );
      expect(screen.getByRole('button', { name: /enviar respostas/i })).toBeDisabled();
    });

    it('está desabilitado quando só um dos cards está respondido', () => {
      render(
        <ElicitacaoRound
          perguntas={PERGUNTAS}
          rodada={1}
          projectId="proj-1"
          onEnviado={jest.fn()}
        />
      );
      // Responde apenas q1
      fireEvent.click(screen.getByText('Python'));
      expect(screen.getByRole('button', { name: /enviar respostas/i })).toBeDisabled();
    });

    it('fica habilitado quando todos os cards estão respondidos', () => {
      render(
        <ElicitacaoRound
          perguntas={PERGUNTAS}
          rodada={1}
          projectId="proj-1"
          onEnviado={jest.fn()}
        />
      );
      fireEvent.click(screen.getByText('Python'));
      fireEvent.click(screen.getByText('B2B'));
      expect(screen.getByRole('button', { name: /enviar respostas/i })).not.toBeDisabled();
    });

    it('card com só texto: fica habilitado ao digitar', () => {
      const perguntaSoTexto = [{ id: 'q1', texto: 'Descreva', opcoes: [], permite_texto: true }];
      render(
        <ElicitacaoRound
          perguntas={perguntaSoTexto}
          rodada={1}
          projectId="proj-1"
          onEnviado={jest.fn()}
        />
      );
      fireEvent.change(screen.getByRole('textbox'), { target: { value: 'minha resposta' } });
      expect(screen.getByRole('button', { name: /enviar respostas/i })).not.toBeDisabled();
    });
  });

  describe('botão Gerar agora', () => {
    it('não aparece na rodada 1', () => {
      render(
        <ElicitacaoRound
          perguntas={PERGUNTAS}
          rodada={1}
          projectId="proj-1"
          onEnviado={jest.fn()}
        />
      );
      expect(screen.queryByRole('button', { name: /gerar agora/i })).not.toBeInTheDocument();
    });

    it('aparece na rodada 2', () => {
      render(
        <ElicitacaoRound
          perguntas={PERGUNTAS}
          rodada={2}
          projectId="proj-1"
          onEnviado={jest.fn()}
        />
      );
      expect(screen.getByRole('button', { name: /gerar agora/i })).toBeInTheDocument();
    });

    it('aparece quando pronto=true mesmo na rodada 1', () => {
      render(
        <ElicitacaoRound
          perguntas={PERGUNTAS}
          rodada={1}
          pronto={true}
          projectId="proj-1"
          onEnviado={jest.fn()}
        />
      );
      expect(screen.getByRole('button', { name: /gerar agora/i })).toBeInTheDocument();
    });
  });

  describe('renderização de cards', () => {
    it('renderiza um card por pergunta', () => {
      render(
        <ElicitacaoRound
          perguntas={PERGUNTAS}
          rodada={1}
          projectId="proj-1"
          onEnviado={jest.fn()}
        />
      );
      expect(screen.getByText('Qual a stack de backend?')).toBeInTheDocument();
      expect(screen.getByText('Qual o público-alvo?')).toBeInTheDocument();
    });
  });
});
