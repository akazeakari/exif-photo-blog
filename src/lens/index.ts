import { Photo } from '@/photo';
import { parameterize } from '@/utility/string';

const LENS_PLACEHOLDER: Lens = { make: 'Lens', model: 'Model' };

const LENS_MAKE_APPLE = 'apple';

export type Lens = {
  make: string
  model: string
};

export interface LensProps {
  params: Promise<Lens>
}

export interface PhotoLensProps {
  params: Promise<Lens & { photoId: string }>
}

export type LensWithCount = {
  lensKey: string
  lens: Lens
  count: number
}

export type Lenses = LensWithCount[];

// Support keys for make-only and model-only lens queries
export const createLensKey = ({ make, model }: Partial<Lens>) =>
  parameterize(`${make ?? 'ANY'}-${model ?? 'ANY'}`);

export const getLensFromParams = ({
  make,
  model,
}: {
  make: string,
  model: string,
}): Lens => ({
  make: parameterize(make),
  model: parameterize(model),
});

export const sortLensesWithCount = (
  a: LensWithCount,
  b: LensWithCount,
) => {
  const aText = formatLensText(a.lens);
  const bText = formatLensText(b.lens);
  return aText.localeCompare(bText);
};

export const lensFromPhoto = (
  photo: Photo | undefined,
  fallback?: Lens,
): Lens =>
  photo?.lensMake && photo?.lensModel
    ? { make: photo.lensMake, model: photo.lensModel }
    : fallback ?? LENS_PLACEHOLDER;

const isLensMakeApple = (make?: string) =>
  make?.toLocaleLowerCase() === LENS_MAKE_APPLE;

export const isLensApple = ({ make }: Lens) =>
  isLensMakeApple(make);

const formatAppleLensText = (
  model: string,
  includePhoneName?: boolean,
) => {
  if (model.includes('15 Pro')) {
    const phoneName = '15 Pro';
    if (model.includes('front')) { return includePhoneName
      ? `${phoneName}: Front Camera`
      : 'Front Camera'; }
    if (model.includes('f/2.2')) { return includePhoneName
      ? `${phoneName}: Wide Camera`
      : 'Wide Camera'; }
    if (model.includes('f/1.78')) { return includePhoneName
      ? `${phoneName}: Main Camera`
      : 'Main Camera'; }
    if (model.includes('f/2.8')) { return includePhoneName
      ? `${phoneName}: Telephoto Camera`
      : 'Telephoto Camera'; }
  }
  return model;
};

export const formatLensText = (
  { make, model: modelRaw }: Lens,
  length:
    'long' |    // Unmodified make and model
    'medium' |  // Make and model, with modifiers removed
    'short'     // Model only
  = 'short',
) => {
  // Capture simple make without modifiers like 'Corporation' or 'Company'
  const makeSimple = make.match(/^(\S+)/)?.[1];
  const doesModelStartWithMake = (
    makeSimple &&
    modelRaw.toLocaleLowerCase().startsWith(makeSimple.toLocaleLowerCase())
  );

  const model = isLensMakeApple(make)
    ? formatAppleLensText(modelRaw, length === 'medium')
    : modelRaw;

  switch (length) {
  case 'long':
    return `${make} ${model}`;
  case 'medium':
    return doesModelStartWithMake
      ? model.replace(makeSimple, '').trim()
      : model;
  case 'short':
    return doesModelStartWithMake
      ? model.replace(makeSimple, '').trim()
      : model;
  }
};
