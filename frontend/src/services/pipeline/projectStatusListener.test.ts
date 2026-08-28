jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
  getApps: jest.fn(),
  getApp: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  connectFirestoreEmulator: jest.fn(),
  doc: jest.fn(),
  onSnapshot: jest.fn(),
}));

import { getApps, initializeApp } from 'firebase/app';
import { connectFirestoreEmulator, doc, getFirestore, onSnapshot } from 'firebase/firestore';
import { subscribeToProjectStatus } from './projectStatusListener';

describe('subscribeToProjectStatus', () => {
  beforeEach(() => {
    (getApps as jest.Mock).mockReturnValue([]);
    (initializeApp as jest.Mock).mockReturnValue({});
    (getFirestore as jest.Mock).mockReturnValue({});
    (connectFirestoreEmulator as jest.Mock).mockImplementation(() => {});
    (doc as jest.Mock).mockReturnValue({});
  });

  it('calls onUpdate with the document data whenever the snapshot fires', () => {
    const onUpdate = jest.fn();
    const unsubscribeMock = jest.fn();
    (onSnapshot as jest.Mock).mockImplementation((_ref, callback) => {
      callback({ data: () => ({ status: 'CONCLUIDO', readme: '# README' }) });
      return unsubscribeMock;
    });

    const unsubscribe = subscribeToProjectStatus('abc123', onUpdate);

    expect(onUpdate).toHaveBeenCalledWith({ status: 'CONCLUIDO', readme: '# README' });

    unsubscribe();
    expect(unsubscribeMock).toHaveBeenCalled();
  });

  it('ignores snapshots with no data (document not created yet)', () => {
    const onUpdate = jest.fn();
    (onSnapshot as jest.Mock).mockImplementation((_ref, callback) => {
      callback({ data: () => undefined });
      return jest.fn();
    });

    subscribeToProjectStatus('abc123', onUpdate);

    expect(onUpdate).not.toHaveBeenCalled();
  });
});
