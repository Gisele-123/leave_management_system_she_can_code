FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

COPY auth-service/pom.xml ./
COPY auth-service/src ./src

RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app

COPY --from=build /build/target/auth-service-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8081

# Run the JAR
ENTRYPOINT ["java","-jar","/app/app.jar"]
