import json

import pydgraph

client_stub = pydgraph.DgraphClientStub('localhost:9080')
client = pydgraph.DgraphClient(client_stub)


def run_query(query):
    txn = client.txn(read_only=True)
    try:
        res = json.loads(txn.query(query).json)
        return res
    finally:
        txn.discard()

r = run_query("""
{
    q(func: eq(process_id, 1234)) {
        uid,
        process_id,
    }
}
""")

print(run_query(r))