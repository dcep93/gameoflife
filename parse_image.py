import Image

d = {}


def compress(triple):
	return tuple([i/86 for i in triple])

def get_colors(im):
	colors = ['white','black','blue','yellow','red','green','brown','orange']
	used_colors = ['white','black']
	for i in im.getdata():
		if compress(i[:3]) not in d:
			im = Image.new("RGB", (512, 512),i[:3])
			im.show()
			d[compress(i[:3])] = raw_input(i[:3])
		if d[compress(i[:3])] not in used_colors:
			used_colors.append(d[compress(i[:3])])
	for i in range(7,-1,-1):
		if colors[i] not in used_colors:
			colors = colors[:i]+colors[i+1:]
	return colors

def get_param(name,flag):
	im = Image.open(name)
	if flag:
		im = im.resize([100,50])
	else:
		size = [130,60]
		if 130 > im.size[0]:
			size[0] = im.size[0]
		if 60 > im.size[1]:
			size[1] = im.size[1]
		ratio = min(float(size[0])/im.size[0],float(size[1])/im.size[1])
		im = im.resize((int(im.size[0]*ratio),int(im.size[1]*ratio)))
	colors = get_colors(im)
	columns,rows = im.size
	string = "var %s = Preset(%s,%s,\n\t{" % (name.split('.')[-2],rows,columns)
	for i in range(columns):
		for j in range(rows):
			color = d[compress(im.getpixel((i,j))[:3])]
			if color != "white":
				string += '"%s,%s":%s, ' % (j,i,color)
	string += '},\n\t10,10,['
	for i in colors[2:]:
		string += i+','
	string += '],\n\t"%s");' % name.split('.')[-2].capitalize()

	print string
	

get_param("guns.png",True)
