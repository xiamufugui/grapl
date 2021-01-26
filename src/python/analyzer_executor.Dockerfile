FROM grapl/grapl-python-build:latest AS analyzer-executor-build
USER grapl
WORKDIR /home/grapl
COPY --chown=grapl analyzer_executor analyzer_executor
COPY --from=grapl/grapl-analyzerlib-python-build /home/grapl/venv venv

# This is a bit of a hack at the moment. The analyzer-executor directly depends
# on grapl-common, but it was only resolving that dependency indirectly through
# analyzerlib. However, analyzerlib didn't actually *use* grapl-common, so when
# it was removed from analyzerlib's formal dependency list, analyzer-executor
# broke. 
#
# Though the way of resolving this dependency presented here is a bit of a hack,
# it at least captures the direct dependency in some way. It is intended to
# remain like this until we can better organize our Python monorepo in order to
# express these inner-repo dependencies in a more formal way.
#
# (This is also why this Dockerfile must live at the top of our Python code
# directory hierarchy; all the code has to be in the container build context.)
COPY --chown=grapl grapl-common grapl-common
RUN /bin/bash -c "source venv/bin/activate && cd grapl-common && pip install ."

RUN /bin/bash -c "source venv/bin/activate && cd analyzer_executor && pip install ."
RUN cd venv/lib/python3.7/site-packages/ && zip --quiet -9r ~/lambda.zip ./
# cannot for the life of me figure out how to get **/* to work with this
RUN cd analyzer_executor/src/ && zip -v -g ~/lambda.zip ./*.py ./analyzer_executor_lib/*.py
RUN mkdir -p dist/analyzer-executor && cp ~/lambda.zip dist/analyzer-executor/lambda.zip

FROM grapl/grapl-python-deploy AS grapl-analyzer-executor
USER grapl
WORKDIR /home/grapl
COPY --from=analyzer-executor-build /home/grapl/lambda.zip lambda.zip
COPY --from=analyzer-executor-build /home/grapl/venv venv
COPY --from=analyzer-executor-build /home/grapl/analyzer_executor analyzer_executor
