import { Papel } from './enums/papel.js';

export const COMPETENCIAS_POR_PAPEL: Readonly<Record<Papel, readonly string[]>> = {
  [Papel.DIRETOR]: ['direcao', 'narrativa', 'lideranca'],
  [Papel.DIRETOR_FOTOGRAFIA]: ['fotografia', 'iluminacao', 'operacao_camera'],
  [Papel.SONOPLASTA]: ['som_direto', 'microfonacao', 'mixagem'],
  [Papel.EDITOR]: ['montagem', 'ritmo', 'color_grading'],
  [Papel.ROTEIRISTA]: ['roteiro', 'estrutura_narrativa', 'dialogo'],
  [Papel.VFX]: ['modelagem_3d', 'renderizacao', 'composicao', 'vfx'],
};

export function competenciasDe(papel: Papel): readonly string[] {
  return COMPETENCIAS_POR_PAPEL[papel];
}
