export class CreateStateDto {
    uuid: string;
    name: string;
    geom?: any;
    created_on?: string | Date;
    updated_on?: string | Date;
}