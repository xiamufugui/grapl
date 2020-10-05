#!/usr/bin/env bash

DIST_DIR=hot_dist

mk-dist() {
  mkdir -p ${DIST_DIR}/{rust,python/zip,js} 2>/dev/null
}

#
# House keeping
#

clean-rust() {
  sudo rm -rf ${DIST_DIR}/rust
}

clean-python() {
  sudo rm -rf ${DIST_DIR}/python
}

clean-js() {
  sudo rm -rf ${DIST_DIR}/js
}

clean-all() {
  clean-rust
  clean-python
  clean-js
  mk-dist
}

#
# Rust
#


build-rust-image() {
 docker build --build-arg UID=$(id -u) --build-arg GID=$(id -g) -t "grapl-rust-build-hotness" - <<'EOF'
FROM rust:1.46-slim-buster

RUN apt-get update && apt-get install -y apt-utils musl musl-dev musl-tools wget
RUN wget -q https://github.com/mozilla/sccache/releases/download/0.2.13/sccache-0.2.13-x86_64-unknown-linux-musl.tar.gz && tar xvzf sccache-0.2.13-x86_64-unknown-linux-musl.tar.gz && cp sccache-0.2.13-x86_64-unknown-linux-musl/sccache /usr/bin/

ARG UID=1000
ARG GID=1000
RUN groupadd -g $GID -o grapl && \
  adduser --disabled-password --gecos '' --home /grapl --shell /bin/bash --uid $UID --gid $GID grapl
USER grapl
WORKDIR /grapl

RUN rustup target add x86_64-unknown-linux-musl
EOF
}

build-rust-src() {
  docker run --rm -it \
    --env RUSTC_WRAPPER=sccache \
    -v ${HOME}/.cache/sccache:/grapl/.cache/sccache \
    -v ${PWD}/src/rust/Cargo.toml:/grapl/Cargo.toml:ro \
    -v ${PWD}/src/rust/Cargo.lock:/grapl/Cargo.lock:ro \
    -v ${PWD}/src/rust/analyzer-dispatcher:/grapl/analyzer-dispatcher:ro \
    -v ${PWD}/src/rust/derive-dynamic-node:/grapl/derive-dynamic-node:ro \
    -v ${PWD}/src/rust/generic-subgraph-generator:/grapl/generic-subgraph-generator:ro \
    -v ${PWD}/src/rust/graph-descriptions:/grapl/graph-descriptions:ro \
    -v ${PWD}/src/rust/graph-generator-lib:/grapl/graph-generator-lib:ro \
    -v ${PWD}/src/rust/graph-merger:/grapl/graph-merger:ro \
    -v ${PWD}/src/rust/grapl-config:/grapl/grapl-config:ro \
    -v ${PWD}/src/rust/grapl-observe:/grapl/grapl-observe:ro \
    -v ${PWD}/src/rust/metric-forwarder:/grapl/metric-forwarder:ro \
    -v ${PWD}/src/rust/node-identifier:/grapl/node-identifier:ro \
    -v ${PWD}/src/rust/sysmon-subgraph-generator:/grapl/sysmon-subgraph-generator:ro \
    -v ${PWD}/${DIST_DIR}/rust:/grapl/target \
    -t grapl-rust-build-hotness \
    bash -c "cargo build --target=x86_64-unknown-linux-musl && sccache -s"
}

build-and-test-rust-src() {
  docker run --rm -it \
    --env RUSTC_WRAPPER=sccache \
    -v ${HOME}/.cache/sccache:/grapl/.cache/sccache \
    -v ${PWD}/src/rust/Cargo.toml:/grapl/Cargo.toml:ro \
    -v ${PWD}/src/rust/Cargo.lock:/grapl/Cargo.lock:ro \
    -v ${PWD}/src/rust/analyzer-dispatcher:/grapl/analyzer-dispatcher:ro \
    -v ${PWD}/src/rust/derive-dynamic-node:/grapl/derive-dynamic-node:ro \
    -v ${PWD}/src/rust/generic-subgraph-generator:/grapl/generic-subgraph-generator:ro \
    -v ${PWD}/src/rust/graph-descriptions:/grapl/graph-descriptions:ro \
    -v ${PWD}/src/rust/graph-generator-lib:/grapl/graph-generator-lib:ro \
    -v ${PWD}/src/rust/graph-merger:/grapl/graph-merger:ro \
    -v ${PWD}/src/rust/grapl-config:/grapl/grapl-config:ro \
    -v ${PWD}/src/rust/grapl-observe:/grapl/grapl-observe:ro \
    -v ${PWD}/src/rust/metric-forwarder:/grapl/metric-forwarder:ro \
    -v ${PWD}/src/rust/node-identifier:/grapl/node-identifier:ro \
    -v ${PWD}/src/rust/sysmon-subgraph-generator:/grapl/sysmon-subgraph-generator:ro \
    -v ${PWD}/${DIST_DIR}/rust:/grapl/target \
    -t grapl-rust-build-hotness \
    bash -c "cargo build --target=x86_64-unknown-linux-musl && \
      cargo test --target=x86_64-unknown-linux-musl && sccache -s"
}

build-and-test-not-ephemeral-rust-src() {
  docker run -it \
    --name rust-src-build \
    --env RUSTC_WRAPPER=sccache \
    -v ${HOME}/.cache/sccache:/grapl/.cache/sccache \
    -v ${PWD}/src/rust/Cargo.toml:/grapl/Cargo.toml:ro \
    -v ${PWD}/src/rust/Cargo.lock:/grapl/Cargo.lock:ro \
    -v ${PWD}/src/rust/analyzer-dispatcher:/grapl/analyzer-dispatcher:ro \
    -v ${PWD}/src/rust/derive-dynamic-node:/grapl/derive-dynamic-node:ro \
    -v ${PWD}/src/rust/generic-subgraph-generator:/grapl/generic-subgraph-generator:ro \
    -v ${PWD}/src/rust/graph-descriptions:/grapl/graph-descriptions:ro \
    -v ${PWD}/src/rust/graph-generator-lib:/grapl/graph-generator-lib:ro \
    -v ${PWD}/src/rust/graph-merger:/grapl/graph-merger:ro \
    -v ${PWD}/src/rust/grapl-config:/grapl/grapl-config:ro \
    -v ${PWD}/src/rust/grapl-observe:/grapl/grapl-observe:ro \
    -v ${PWD}/src/rust/metric-forwarder:/grapl/metric-forwarder:ro \
    -v ${PWD}/src/rust/node-identifier:/grapl/node-identifier:ro \
    -v ${PWD}/src/rust/sysmon-subgraph-generator:/grapl/sysmon-subgraph-generator:ro \
    -v ${PWD}/${DIST_DIR}/rust:/grapl/target \
    -t grapl-rust-build-hotness \
    bash -c "cargo build --target=x86_64-unknown-linux-musl && \
      cargo test --target=x86_64-unknown-linux-musl && sccache -s"
}

build-rust() {
  build-rust-image
  build-rust-src
}

build-and-test-rust() {
  build-rust-image
  build-and-test-rust-src
}

#
# Python
#

build-python() {
  docker build --build-arg UID=$(id -u) --build-arg GID=$(id -g) -t "grapl-python-build-hotness" - <<'EOF'
FROM python:3.7-slim-buster

RUN apt-get update && apt-get -y install --no-install-recommends musl-dev protobuf-compiler build-essential zip bash

ARG UID=1000
ARG GID=1000
RUN groupadd -g $GID -o grapl && \
  adduser --disabled-password --gecos '' --home /grapl --shell /bin/bash --uid $UID --gid $GID grapl
USER grapl
WORKDIR /grapl

ENV PROTOC /usr/bin/protoc
ENV PROTOC_INCLUDE /usr/include

RUN bash -c "python3 -mvenv venv && source venv/bin/activate && \
  pip install --upgrade pip && \
  pip install wheel grpcio chalice hypothesis pytest pytest-xdist"
EOF

  # grapl-common grapl_analyzerlib graph-descriptions
  mkdir ${DIST_DIR}/python/grapl-libs

  docker run --rm -it \
    -v ${HOME}/.cache/pip:/grapl/.cache/pip \
    -v ${PWD}/src/python/grapl-common:/grapl/grapl-common \
    -v ${PWD}/src/python/grapl_analyzerlib:/grapl/grapl_analyzerlib \
    -v ${PWD}/src/rust/graph-descriptions:/grapl/graph-descriptions \
    -v ${PWD}/${DIST_DIR}/python/grapl-libs:/grapl/dist \
    -t grapl-python-build-hotness \
    bash -c "source venv/bin/activate && \
      cd ~/grapl-common && pip install . && python setup.py sdist bdist_wheel && \
      cd ~/graph-descriptions && pip install . && python setup.py sdist bdist_wheel && \
      cd ~/grapl_analyzerlib && pip install . && python setup.py sdist bdist_wheel && \
      cp -r ~/venv ~/dist/"

  # analyzer-deployer
  cp -r ${DIST_DIR}/python/grapl-libs ${DIST_DIR}/python/analyzer-deployer

  docker run --rm -it \
    -v ${HOME}/.cache/pip:/grapl/.cache/pip \
    -v ${PWD}/src/python/analyzer-deployer:/grapl/analyzer-deployer \
    -v ${PWD}/${DIST_DIR}/python/zip:/grapl/dist \
    -v ${PWD}/${DIST_DIR}/python/analyzer-deployer/venv:/grapl/venv \
    -t grapl-python-build-hotness \
    bash -c "source venv/bin/activate && \
      pip install -r analyzer-deployer/requirements.txt && \
      python -m mypy_boto3 && \
      cd ~/venv/lib/python3.7/site-packages && zip --quiet -9r ~/dist/analyzer-deployer.zip . && \
      zip -g ~/dist/analyzer-deployer.zip ~/analyzer-deployer/analyzer_deployer/app.py"

  # analyzer-executor
  cp -r ${DIST_DIR}/python/grapl-libs ${DIST_DIR}/python/analyzer-executor

  docker run --rm -it \
    -v ${HOME}/.cache/pip:/grapl/.cache/pip \
    -v ${PWD}/src/python/analyzer_executor:/grapl/analyzer_executor \
    -v ${PWD}/${DIST_DIR}/python/zip:/grapl/dist \
    -v ${PWD}/${DIST_DIR}/python/analyzer-executor/venv:/grapl/venv \
    -t grapl-python-build-hotness \
    bash -c "source venv/bin/activate && \
      pip install -r analyzer_executor/requirements.txt && \
      cd ~/venv/lib/python3.7/site-packages && zip --quiet -9r ~/dist/analyzer-executor.zip . && \
      zip -g ~/dist/analyzer-executor.zip ~/analyzer_executor/src/analyzer-executor.py"

  # engagement-creator
  cp -r ${DIST_DIR}/python/grapl-libs ${DIST_DIR}/python/engagement-creator

  docker run --rm -it \
    -v ${HOME}/.cache/pip:/grapl/.cache/pip \
    -v ${PWD}/src/python/engagement-creator:/grapl/engagement-creator \
    -v ${PWD}/${DIST_DIR}/python/zip:/grapl/dist \
    -v ${PWD}/${DIST_DIR}/python/engagement-creator/venv:/grapl/venv \
    -t grapl-python-build-hotness \
    bash -c "source venv/bin/activate && \
      pip install -r engagement-creator/requirements.txt && \
      cd ~/venv/lib/python3.7/site-packages && zip --quiet -9r ~/dist/engagement-creator.zip . && \
      zip -g ~/dist/engagement-creator.zip ~/engagement-creator/src/engagement-creator.py"

  # engagement_edge
  cp -r ${DIST_DIR}/python/grapl-libs ${DIST_DIR}/python/engagement_edge
  mkdir ${DIST_DIR}/python/engagement_edge/chalice

  docker run --rm -it \
    -v ${HOME}/.cache/pip:/grapl/.cache/pip \
    -v ${PWD}/src/python/engagement_edge:/grapl/engagement_edge \
    -v ${PWD}/${DIST_DIR}/python/zip:/grapl/dist \
    -v ${PWD}/${DIST_DIR}/python/engagement_edge/chalice:/grapl/chalice \
    -v ${PWD}/${DIST_DIR}/python/engagement_edge/venv:/grapl/venv \
    -t grapl-python-build-hotness \
    bash -c "source venv/bin/activate && \
      pip install -r engagement_edge/requirements.txt && \
      chalice new-project ~/chalice/app/ && cp /grapl/engagement_edge/src/engagement_edge.py app/app.py && \
      cd ~/venv/lib/python3.7/site-packages && zip --quiet -9r ~/dist/engagement-edge.zip . && \
      zip -g ~/dist/engagement-edge.zip ~/engagement_edge/src/engagement_edge.py"

  # dgraph-ttl
  cp -r ${DIST_DIR}/python/grapl-libs ${DIST_DIR}/python/dgraph-ttl

  docker run --rm -it \
    -v ${HOME}/.cache/pip:/grapl/.cache/pip \
    -v ${PWD}/src/python/grapl-dgraph-ttl:/grapl/grapl-dgraph-ttl \
    -v ${PWD}/${DIST_DIR}/python/zip:/grapl/dist \
    -v ${PWD}/${DIST_DIR}/python/dgraph-ttl/venv:/grapl/venv \
    -t grapl-python-build-hotness \
    bash -c "source venv/bin/activate && \
      pip install -r grapl-dgraph-ttl/requirements.txt && \
      cd ~/venv/lib/python3.7/site-packages && zip --quiet -9r ~/dist/dgraph-ttl.zip . && \
      zip -g ~/dist/dgraph-ttl.zip ~/grapl-dgraph-ttl/app.py"

  # model-plugin-deployer
  cp -r ${DIST_DIR}/python/grapl-libs ${DIST_DIR}/python/model-plugin-deployer
  mkdir ${DIST_DIR}/python/model-plugin-deployer/chalice

  docker run --rm -it \
    -v ${HOME}/.cache/pip:/grapl/.cache/pip \
    -v ${PWD}/src/python/grapl-model-plugin-deployer:/grapl/grapl-model-plugin-deployer \
    -v ${PWD}/${DIST_DIR}/python/zip:/grapl/dist \
    -v ${PWD}/${DIST_DIR}/python/model-plugin-deployer/chalice:/grapl/chalice \
    -v ${PWD}/${DIST_DIR}/python/model-plugin-deployer/venv:/grapl/venv \
    -t grapl-python-build-hotness \
    bash -c "source venv/bin/activate && \
      pip install -r grapl-model-plugin-deployer/requirements.txt && \
      chalice new-project ~/chalice/app/ && cp ~/grapl-model-plugin-deployer/src/grapl_model_plugin_deployer.py ~/chalice/app/app.py && \
      cd ~/venv/lib/python3.7/site-packages && zip --quiet -9r ~/dist/model-plugin-deployer.zip . && \
      zip -g ~/dist/model-plugin-deployer.zip ~/grapl-model-plugin-deployer/src/grapl_model_plugin_deployer.py"
}

build-js() {
  
  docker build -t "grapl-engagement-view-hotness" - <<'EOF'
FROM node:12.18-buster-slim

RUN apt-get update && apt-get -y install --no-install-recommends build-essential libffi-dev libssl-dev python3 zip
USER node
WORKDIR /home/node
EOF

  # engagement-view
  mkdir ${DIST_DIR}/js/engagement_view
  docker run --rm -it \
    -v ${PWD}/${DIST_DIR}/js/engagement_view:/home/node/dist \
    -v ${PWD}/src/js/engagement_view:/home/node/engagement_view \
    -t grapl-engagement-view-hotness \
    bash -c "cd engagement_view && yarn install && yarn build && cp -r build/. /home/node/dist/"

  docker build -t "grapl-graphql-build-hotness" - <<'EOF'
FROM node:12.18-buster-slim

RUN apt-get update && apt-get -y install --no-install-recommends build-essential libffi-dev libssl-dev python3 zip
USER node
WORKDIR /home/node
EOF

  # graphql_endpoint
  mkdir ${DIST_DIR}/js/graphql_endpoint

  docker run --rm -it \
    -v ${PWD}/${DIST_DIR}/js/graphql_endpoint:/home/node/dist \
    -v ${PWD}/src/js/graphql_endpoint:/home/node/graphql_endpoint \
    -t grapl-graphql-build-hotness \
    bash -c "cd graphql_endpoint && rm -rf node_modules && npm i && \
      mkdir ~/dist/lambda && \
      cp -r ~/graphql_endpoint/node_modules/ ~/dist/lambda/ && \
      cp -r ~/graphql_endpoint/modules/ ~/dist/lambda/ && \
      cp -r ~/graphql_endpoint/server.js ~/dist/lambda/ && \
      cp -r ~/graphql_endpoint/package.json ~/dist/lambda/ && \
      cp -r ~/graphql_endpoint/package-lock.json ~/dist/lambda/ && \
      cd ~/dist/lambda && zip --quiet -9r ~/dist/graphql_endpoint.zip ."
}

run-rust-unit-tests() {
  docker run --rm -it \
    --env RUSTC_WRAPPER=sccache \
    -v ${HOME}/.cache/sccache:/grapl/.cache/sccache \
    -v ${PWD}/src/rust:/grapl/rust \
    -v ${PWD}/${DIST_DIR}/rust:/grapl/rust/target \
    -t grapl-rust-build-hotness \
    bash -c "cd rust && cargo test --target=x86_64-unknown-linux-musl"
}

run-analyzerlib-integration-tests() {
  docker run --rm -it \
    --network host \
    --env GRAPL_LOG_LEVEL=INFO \
    --env BUCKET_PREFIX=local-grapl \
    --env IS_LOCAL=True \
    --env MG_ALPHAS=127.0.0.1:9080 \
    -v $(pwd)/src/python/grapl_analyzerlib:/grapl/grapl_analyzerlib \
    -v $(pwd)/hot_dist/python/grapl-libs/venv:/grapl/venv \
    -t grapl-python-build-hotness \
    bash -c "source venv/bin/activate && cd grapl_analyzerlib && py.test -n auto -m 'integration_test'"
}

run-analyzer-deployer-integration-tests() {
  docker run --rm -it \
    --network host \
    --env GRAPL_LOG_LEVEL=INFO \
    --env BUCKET_PREFIX=local-grapl \
    --env IS_LOCAL=True \
    -v $(pwd)/src/python/analyzer-deployer:/grapl/analyzer-deployer \
    -v $(pwd)/hot_dist/python/analyzer-deployer/venv:/grapl/venv \
    -t grapl-python-build-hotness \
    bash -c "source venv/bin/activate && cd analyzer-deployer && py.test -n auto -m 'integration_test'"
}

run-node-identifier-integration-test() {
  docker run --rm -it \
    --env RUSTC_WRAPPER=sccache \
    -v ${HOME}/.cache/sccache:/grapl/.cache/sccache \
    -v ${PWD}/src/rust/Cargo.toml:/grapl/Cargo.toml:ro \
    -v ${PWD}/src/rust/Cargo.lock:/grapl/Cargo.lock:ro \
    -v ${PWD}/src/rust/analyzer-dispatcher:/grapl/analyzer-dispatcher:ro \
    -v ${PWD}/src/rust/derive-dynamic-node:/grapl/derive-dynamic-node:ro \
    -v ${PWD}/src/rust/generic-subgraph-generator:/grapl/generic-subgraph-generator:ro \
    -v ${PWD}/src/rust/graph-descriptions:/grapl/graph-descriptions:ro \
    -v ${PWD}/src/rust/graph-generator-lib:/grapl/graph-generator-lib:ro \
    -v ${PWD}/src/rust/graph-merger:/grapl/graph-merger:ro \
    -v ${PWD}/src/rust/grapl-config:/grapl/grapl-config:ro \
    -v ${PWD}/src/rust/grapl-observe:/grapl/grapl-observe:ro \
    -v ${PWD}/src/rust/metric-forwarder:/grapl/metric-forwarder:ro \
    -v ${PWD}/src/rust/node-identifier:/grapl/node-identifier:ro \
    -v ${PWD}/src/rust/sysmon-subgraph-generator:/grapl/sysmon-subgraph-generator:ro \
    -v ${PWD}/${DIST_DIR}/rust:/grapl/target \
    -t grapl-rust-build-hotness \
    bash -c "cargo test --target=x86_64-unknown-linux-musl --manifest-path node-identifier/Cargo.toml --features integration"
}

run-integration-tests() {
  docker-compose up -d
  sleep 30
  run-analyzerlib-integration-tests
  run-analyzer-deployer-integration-tests
  run-node-identifier-integration-test
}

clean-all
#build-rust
#build-rust-src
build-and-test-rust-src
build-python
build-js

#build-and-test-not-ephemeral-rust-src

#run-rust-unit-tests

run-integration-tests

docker-compose down

