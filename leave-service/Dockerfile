# syntax=docker/dockerfile:1
FROM --platform=$BUILDPLATFORM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml ./
RUN mvn -q -e -DskipTests package || true
COPY src ./src
RUN mvn -q -DskipTests package

FROM --platform=$BUILDPLATFORM eclipse-temurin:21-jre AS runtime
WORKDIR /app
COPY --from=build /build/target/leave-service-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java","-jar","/app/app.jar"]
