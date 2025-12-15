// --- 3D 환경 변수 초기화 ---
const container = document.getElementById('viewer-container');
let scene, camera, renderer, controls;
let currentModel = null; // 현재 로드된 3D 모델 객체를 저장

// GLTF 로더 초기화
const loader = new THREE.GLTFLoader();

// --- 초기화 함수 ---
function init() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 장면(Scene)
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    // 씬에 약간의 안개를 추가하여 깊이감을 줍니다
    scene.fog = new THREE.Fog(0x1a1a1a, 10, 50);

    // 카메라(Camera)
    camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 5, 10);

    // 렌더러(Renderer)
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    
    // 조명(Lighting): 전문적인 모델링 사이트처럼 3점 조명 설정
    setupLighting();
    
    // OrbitControls 설정 (마우스 상호작용)
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 부드러운 회전
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 30;

    // 초기 모델 로드 (가장 첫 번째 모델)
    const initialModel = document.querySelector('#model-menu li');
    if (initialModel) {
        loadModel(initialModel.dataset.model, initialModel.dataset.name);
        initialModel.classList.add('active');
    }

    animate();
}

function setupLighting() {
    // 키 라이트 (주광원)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(5, 5, 5);
    scene.add(keyLight);

    // 필 라이트 (보조광원 - 그림자 완화)
    const fillLight = new THREE.DirectionalLight(0xadd8e6, 0.5); // 약간 푸른색
    fillLight.position.set(-5, 0, -5);
    scene.add(fillLight);

    // 림 라이트 (역광 - 모델의 윤곽 강조)
    const rimLight = new THREE.DirectionalLight(0xffccaa, 0.7); // 따뜻한 색
    rimLight.position.set(0, -5, 5);
    scene.add(rimLight);

    // 환경광
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
}

// --- 모델 로드 및 전환 함수 ---
function loadModel(url, name) {
    console.log(`Loading model: ${url}`);
    
    // 1. 기존 모델 제거 (전환 효과)
    if (currentModel) {
        scene.remove(currentModel);
        currentModel.traverse((object) => {
            if (!object.isMesh) return;
            object.geometry.dispose();
            if (object.material.isMaterial) {
                // 재질 및 텍스처 메모리 해제
                Object.values(object.material.textures || {}).forEach(t => t && t.dispose());
                object.material.dispose();
            }
        });
        currentModel = null;
    }

    // 로딩 상태 표시 (옵션)
    document.getElementById('current-model-name').textContent = `로딩 중: ${name}...`;

    // 2. 새 모델 로드
    loader.load(
        url,
        function (gltf) {
            currentModel = gltf.scene;
            
            // 모델의 크기 및 위치 조정 (선택 사항)
            const box = new THREE.Box3().setFromObject(currentModel);
            const center = box.getCenter(new THREE.Vector3());
            currentModel.position.sub(center); // 모델의 중심을 씬의 중앙(0,0,0)으로 이동
            
            // 카메라 위치 리셋 및 조정 (새 모델에 맞게)
            controls.reset();
            camera.position.set(0, 5, 10);

            scene.add(currentModel);
            
            // 정보 패널 업데이트
            document.getElementById('current-model-name').textContent = name;
        },
        // 로딩 진행 상황을 위한 함수 (선택 사항)
        function (xhr) {
            const percent = Math.round(xhr.loaded / xhr.total * 100);
            console.log( `${percent}% loaded` );
            document.getElementById('current-model-name').textContent = `${name} (${percent}%) 로딩 중...`;
        },
        // 오류 처리
        function (error) {
            console.error('An error happened during model loading:', error);
            document.getElementById('current-model-name').textContent = `로드 실패: ${name}`;
        }
    );
}

// --- 이벤트 리스너 설정 ---
function setupEventListeners() {
    const modelMenu = document.getElementById('model-menu');

    modelMenu.addEventListener('click', (event) => {
        const listItem = event.target.closest('li');
        if (listItem && listItem.dataset.model) {
            // 1. 모델 로드
            loadModel(listItem.dataset.model, listItem.dataset.name);

            // 2. 활성화된 항목 스타일 업데이트
            modelMenu.querySelectorAll('li').forEach(li => li.classList.remove('active'));
            listItem.classList.add('active');
        }
    });
    
    // 창 크기 변경 시 렌더러와 카메라 업데이트
    window.addEventListener('resize', () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;

        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(newWidth, newHeight);
    });
}

// --- 애니메이션 루프 ---
function animate() {
    requestAnimationFrame(animate);
    
    controls.update(); // OrbitControls가 부드럽게 작동하도록 업데이트

    // 로드된 모델이 있다면, 자동으로 회전시키거나 기타 애니메이션 적용 가능
    // if (currentModel) {
    //     currentModel.rotation.y += 0.005;
    // }

    renderer.render(scene, camera);
}

// --- 사이트 시작 ---
init();
setupEventListeners();