from django.shortcuts import render,redirect,get_object_or_404
from .models import Experiment,Response
from django.http import HttpResponse, JsonResponse
from django.template import RequestContext
from django.views.decorators.csrf import csrf_exempt
import json

# Create your views here.
def front_view(request):
	exp_list = Experiment.objects.all()
	return render(request,'experiments/frontpage.html',{'exp_list' : exp_list})

# @csrf_exempt
# def form2_1(request):
# 	#exp = get_object_or_404(Experiment,pk="2")
# 	exp = get_object_or_404(Experiment,pk=request.POST['expid'])
# 	if request.method == 'POST' and request.is_ajax():
# 		exp.response_set.create(name = request.POST['name'],roll = request.POST['roll'],gender = request.POST['gender'],
# 		age = request.POST['age'],happy1 = request.POST['happy1'],sad1 = request.POST['sad1'],fearful1 = request.POST['fearful1'],
# 		angry1 = request.POST['angry1'],surprised1 = request.POST['surprised1'])
# 	return JsonResponse({'status': 'ok'})

# @csrf_exempt
# def form2_2(request):
# 	exp = get_object_or_404(Experiment,pk=request.POST['expid'])
# 	if request.method == 'POST' and request.is_ajax():
# 		# set = exp.response_set.filter(happy2_startswith=='-1');
# 		# set.surprised2 = request.POST['surprised2'];
# 		exp.response_set.create(name = request.POST['name'],roll = request.POST['roll'],gender = request.POST['gender'],
# 		age = request.POST['age'],happy2 = request.POST['happy2'],sad2 = request.POST['sad2'],fearful2 = request.POST['fearful2'],
# 		angry2 = request.POST['angry2'],surprised2 = request.POST['surprised2'])

# 	return JsonResponse({'status': 'ok'})
		
def exp1_view(request):
	exp = get_object_or_404(Experiment,pk="1")
	
	context = {
		'expid' : exp.pk,
		'title' : exp.title,
		'question' : exp.question,
		'name' : request.POST['Name'],
		'roll' : request.POST['RollNo'],
		'age' : request.POST['Age'],
		'gender' : request.POST['Gender']
	}
	return render(request,'experiments/exp' + str(exp.pk) + '.html',context)

def expNext_view(request):
	exp = get_object_or_404(Experiment,pk=request.POST['expid'])

	data = json.loads(request.POST['data'])
	exp.response_set.create(name = data['scene1']['name'],roll = int(data['scene1']['roll']),gender = data['scene1']['gender'],
		age = int(data['scene1']['age']),happy3 = int(data['scene3']['happy3']),sad3 = int(data['scene3']['sad3']),fearful3 = int(data['scene3']['fearful3']),
		angry3 = int(data['scene3']['angry3']),surprised3 = int(data['scene3']['surprised3']),happy2 = int(data['scene2']['happy2']),sad2 = int(data['scene2']['sad2']),fearful2 = int(data['scene2']['fearful2']),
		angry2 = int(data['scene2']['angry2']),surprised2 = int(data['scene2']['surprised2']),happy1 = int(data['scene1']['happy1']),sad1 = int(data['scene1']['sad1']),fearful1 = int(data['scene1']['fearful1']),
		angry1 = int(data['scene1']['angry1']),surprised1 = int(data['scene1']['surprised1']))

	Newpk = exp.pk + 1
	exp = get_object_or_404(Experiment,pk=Newpk)

	context = {
		'expid' : exp.pk,
		'title' : exp.title,
		'question' : exp.question,
		'name' : data['scene1']['name'],
		'roll' : int(data['scene1']['roll']),
		'age' : int(data['scene1']['age']),
		'gender' : data['scene1']['gender']
	}
	return render(request,'experiments/exp' + str(exp.pk) + '.html',context)

# def exp3_view(request):
# 	exp = get_object_or_404(Experiment,pk=request.POST['expid'])
# 	print(request.POST['data'])
# 	data = json.loads(request.POST['data'])
# 	exp.response_set.create(name = data['scene1']['name'],roll = int(data['scene1']['roll']),gender = data['scene1']['gender'],
# 		age = int(data['scene1']['age']),happy3 = int(data['scene3']['happy3']),sad3 = int(data['scene3']['sad3']),fearful3 = int(data['scene3']['fearful3']),
# 		angry3 = int(data['scene3']['angry3']),surprised3 = int(data['scene3']['surprised3']),happy2 = int(data['scene2']['happy2']),sad2 = int(data['scene2']['sad2']),fearful2 = int(data['scene2']['fearful2']),
# 		angry2 = int(data['scene2']['angry2']),surprised2 = int(data['scene2']['surprised2']),happy1 = int(data['scene1']['happy1']),sad1 = int(data['scene1']['sad1']),fearful1 = int(data['scene1']['fearful1']),
# 		angry1 = int(data['scene1']['angry1']),surprised1 = int(data['scene1']['surprised1']))

# 	Newpk = exp.pk + 1
# 	exp = get_object_or_404(Experiment,pk=Newpk)

# 	context = {
# 		'expid' : exp.pk,
# 		'title' : exp.title,
# 		'question' : exp.question,
# 		'name' : data['scene1']['name'],
# 		'roll' : int(data['scene1']['roll']),
# 		'age' : int(data['scene1']['age']),
# 		'gender' : data['scene1']['gender']
# 	}
# 	return render(request,'experiments/exp' + str(exp.pk) + '.html',context)

# def exp4_view(request):
# 	exp = get_object_or_404(Experiment,pk=request.POST['expid'])
# 	# print(request.POST['data'])
# 	data = json.loads(request.POST['data'])
# 	exp.response_set.create(name = data['scene1']['name'],roll = int(data['scene1']['roll']),gender = data['scene1']['gender'],
# 		age = int(data['scene1']['age']),happy3 = int(data['scene3']['happy3']),sad3 = int(data['scene3']['sad3']),fearful3 = int(data['scene3']['fearful3']),
# 		angry3 = int(data['scene3']['angry3']),surprised3 = int(data['scene3']['surprised3']),happy2 = int(data['scene2']['happy2']),sad2 = int(data['scene2']['sad2']),fearful2 = int(data['scene2']['fearful2']),
# 		angry2 = int(data['scene2']['angry2']),surprised2 = int(data['scene2']['surprised2']),happy1 = int(data['scene1']['happy1']),sad1 = int(data['scene1']['sad1']),fearful1 = int(data['scene1']['fearful1']),
# 		angry1 = int(data['scene1']['angry1']),surprised1 = int(data['scene1']['surprised1']))

# 	Newpk = exp.pk + 1
# 	exp = get_object_or_404(Experiment,pk=Newpk)

# 	context = {
# 		'expid' : exp.pk,
# 		'title' : exp.title,
# 		'question' : exp.question,
# 		'name' : data['scene1']['name'],
# 		'roll' : int(data['scene1']['roll']),
# 		'age' : int(data['scene1']['age']),
# 		'gender' : data['scene1']['gender']
# 	}
# 	return render(request,'experiments/exp' + str(exp.pk) + '.html',context)

def submit_view(request):
	exp = get_object_or_404(Experiment,pk=request.POST['expid'])
	print(request.POST['data'])
	data = json.loads(request.POST['data'])
	exp.response_set.create(name = data['scene1']['name'],roll = int(data['scene1']['roll']),gender = data['scene1']['gender'],
		age = int(data['scene1']['age']),happy3 = int(data['scene3']['happy3']),sad3 = int(data['scene3']['sad3']),fearful3 = int(data['scene3']['fearful3']),
		angry3 = int(data['scene3']['angry3']),surprised3 = int(data['scene3']['surprised3']),happy2 = int(data['scene2']['happy2']),sad2 = int(data['scene2']['sad2']),fearful2 = int(data['scene2']['fearful2']),
		angry2 = int(data['scene2']['angry2']),surprised2 = int(data['scene2']['surprised2']),happy1 = int(data['scene1']['happy1']),sad1 = int(data['scene1']['sad1']),fearful1 = int(data['scene1']['fearful1']),
		angry1 = int(data['scene1']['angry1']),surprised1 = int(data['scene1']['surprised1']))

	return HttpResponse('Thanks for participating!')

def data_view(request,id):
	exp = get_object_or_404(Experiment,pk=id)
	responses_qset = exp.response_set.all()
	responses1 = []
	responses2 = []
	responses3 = []
	for r in responses_qset:
		responses1.append([r.roll,r.happy1,r.sad1,r.fearful1,r.angry1,r.surprised1])
		responses2.append([r.roll,r.happy2,r.sad2,r.fearful2,r.angry2,r.surprised2])
		responses3.append([r.roll,r.happy3,r.sad3,r.fearful3,r.angry3,r.surprised3])

	scene1 = [(0,exp.focus1,exp.eagerness1,exp.arousal1)]
	scene2 = [(1,exp.focus2,exp.eagerness2,exp.arousal2)]
	scene3 = [(2,exp.focus3,exp.eagerness3,exp.arousal3)]

	context = {
	 	'title' : exp.title,
		'question' : exp.question,
		'scene1' : scene1,
		'scene2' : scene2,
		'scene3' : scene3,
		'responses1' : responses1,
		'responses2' : responses2,
		'responses3' : responses3
	}
	return render(request,'experiments/data.html',context)