export class UpdateCategoryDto {
    uuid?: string;
    name?: string;
    father_category?: string;
    created_on?: string | Date;
    updated_on?: string | Date;
}