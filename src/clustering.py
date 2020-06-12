# dataset =  pd.read_csv(filename)
# z = dataset[symptoms]
# X =z.values
# hc = AgglomerativeClustering(n_clusters = 2, affinity = 'euclidean', linkage ='ward')
# y_hc=hc.fit_predict(X)
# dataset['cluster'] = y_hc


#!flask/bin/python
from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
from sklearn.cluster import AgglomerativeClustering 
import pandas as pd

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['POST'])
@cross_origin()
def get_tasks():
	data = request.json
	dataset =  pd.read_csv(data['filename'])
	symp = data['symptoms']
	z = dataset[symp]
	x = z.values
	h = AgglomerativeClustering(n_clusters =2, affinity = 'euclidean', linkage = 'ward')
	y = h.fit_predict(x)
	dataset['cluster'] = y
	dataset = dataset.transpose()
	dataset = dataset.to_dict()

	sum0 = -1
	sum1 = -1

	for index, row in dataset.items():
		if row['cluster'] == 0:
			sum0 =row['sum']
		if row['cluster'] == 1 and sum0 != -1:
			sum1 =row['sum']
			break

	while sum1==sum0:
		sum0 = -1
		for index, row in dataset.items():
			if index > 0:
				if row['cluster'] == 0:
					sum0 = row['sum']
					break
	if sum0 > sum1:
		for index, row in dataset.items():
			if int(row['cluster']) == 0:
				row['cluster'] = 1
			else:
				row['cluster'] = 0

	return jsonify(dataset)

if __name__ == '__main__':
	app.run(debug=True)