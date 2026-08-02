export interface CreateCategoryDto {
  name: string;
  slug: string;
  parentId?: string | undefined;
}
