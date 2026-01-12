# ============================================
# Dockerfile para GymWear Shop - Railway
# ============================================

# Etapa 1: Compilar el frontend Angular
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY app/frontend/package*.json ./
RUN npm ci
COPY app/frontend/ ./
RUN npm run build -- --configuration=production

# Etapa 2: Compilar el backend Spring Boot
FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /app
COPY app/pom.xml ./
RUN mvn dependency:go-offline -B
COPY app/src ./src
# Copiar el frontend compilado a static
COPY --from=frontend-build /frontend/dist/tienda-front/browser ./src/main/resources/static
RUN mvn package -DskipTests -B

# Etapa 3: Imagen final
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=backend-build /app/target/*.jar app.jar

# Variables de entorno por defecto
ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
