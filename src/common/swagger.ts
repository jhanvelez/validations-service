import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const SWAGGER_PATH = 'docs';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Validations Service')
    .setDescription(
      'Registers document validations enriched with the USD/COP exchange rate, persisted in MongoDB and audited in DynamoDB.',
    )
    .setVersion('1.0.0')
    .addTag('validations')
    .addTag('health')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(SWAGGER_PATH, app, document);
}