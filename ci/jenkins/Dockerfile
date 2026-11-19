FROM jenkins/jenkins:lts-jdk21
COPY --from=docker:cli /usr/local/bin/docker /usr/local/bin/docker
RUN jenkins-plugin-cli --plugins workflow-aggregator git github-branch-source docker-workflow junit timestamper pipeline-stage-view