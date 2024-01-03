export class CreateCategoryDto {
    uuid: string;
    name: string;
    father_category?: string;
    created_on?: string | Date;
    updated_on?: string | Date;
}