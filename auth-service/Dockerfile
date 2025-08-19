# syntax=docker/dockerfile:1

# -------------------
# Build stage
# -------------------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# Copy the module pom.xml and source code
COPY auth-service/pom.xml ./
COPY auth-service/src ./src

# Build the JAR (skip tests for faster build)
RUN mvn clean package -DskipTests

# -------------------
# Runtime stage
# -------------------
FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /build/target/auth-service-0.0.1-SNAPSHOT.jar app.jar

# Expose the application port
EXPOSE 8081

# Run the JAR
ENTRYPOINT ["java","-jar","/app/app.jar"]
