# Build stage
FROM --platform=$BUILDPLATFORM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml ./
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM --platform=$BUILDPLATFORM eclipse-temurin:21-jre AS runtime
WORKDIR /app
COPY --from=build /build/target/leave_management-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java","-jar","/app/app.jar"]
