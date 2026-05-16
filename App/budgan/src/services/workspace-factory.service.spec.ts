import { TestBed } from '@angular/core/testing';
import { ID_GENERATOR_SERVICE } from './id-generator.service';
import {
  WORKSPACE_FACTORY_SERVICE,
  WorkspaceFactoryServiceImpl,
} from './workspace-factory.service';
import { Workspace } from '../engine/workspace';

const FIXED_ID = 'test-uuid-1234';

describe('WorkspaceFactoryServiceImpl', () => {
  let service: WorkspaceFactoryServiceImpl;
  let mockIdGenerator: { generateId: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockIdGenerator = { generateId: vi.fn().mockReturnValue(FIXED_ID) };
    TestBed.configureTestingModule({
      providers: [
        { provide: ID_GENERATOR_SERVICE, useValue: mockIdGenerator },
      ],
    });
    service = TestBed.inject(WorkspaceFactoryServiceImpl);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return a Workspace instance', () => {
    expect(service.createWorkspace('My Budget')).toBeInstanceOf(Workspace);
  });

  it('should set the workspace name from the parameter', () => {
    const ws = service.createWorkspace('My Budget');
    expect(ws.name).toBe('My Budget');
  });

  it('should use the IdGeneratorService for the ID', () => {
    service.createWorkspace('My Budget');
    expect(mockIdGenerator.generateId).toHaveBeenCalledTimes(1);
  });

  it('should assign the generated ID to the workspace', () => {
    const ws = service.createWorkspace('My Budget');
    expect(ws.id).toBe(FIXED_ID);
  });

  it('should generate a new ID for each workspace created', () => {
    mockIdGenerator.generateId.mockReturnValueOnce('id-1').mockReturnValueOnce('id-2');
    const ws1 = service.createWorkspace('First');
    const ws2 = service.createWorkspace('Second');
    expect(ws1.id).toBe('id-1');
    expect(ws2.id).toBe('id-2');
  });
});

describe('WORKSPACE_FACTORY_SERVICE token', () => {
  it('should resolve to a WorkspaceFactoryServiceImpl instance', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ID_GENERATOR_SERVICE, useValue: { generateId: vi.fn() } },
        { provide: WORKSPACE_FACTORY_SERVICE, useClass: WorkspaceFactoryServiceImpl },
      ],
    });
    const factory = TestBed.inject(WORKSPACE_FACTORY_SERVICE);
    expect(factory).toBeInstanceOf(WorkspaceFactoryServiceImpl);
  });
});
