// src/pages/AdminPanel.jsx
import React, { useState, useCallback, useMemo } from 'react';
import {
  Button, TextInput, Textarea, Select, Switch, Tabs, Modal, FileInput,
  ActionIcon, Badge, Card, Text, Group, NumberInput, SegmentedControl,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconPlus, IconTrash, IconEdit, IconPhoto, IconLogout, IconCategory,
  IconDiamond, IconShoppingBag, IconCheck, IconX, IconSettings,
  IconLock, IconUpload,
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  addProduct, updateProduct, deleteProduct, toggleSoldOut,
  addCategory, updateCategory, deleteCategory,
  generateId, imageToBase64, changePassword, loadStore, saveStore,
} from '../utils/store';
import { COLORS } from '../utils/theme';

const LOTTIE_OPTIONS = [
  { value: 'https://lottie.host/06a5cb66-9cf7-405e-a96c-6b0c20036d5b/cBH3wxPQH3.lottie', label: 'Colibrí' },
  { value: 'https://lottie.host/454dfe96-d4d9-4938-96f4-db32c761f5d0/SLbWwfzsQh.lottie', label: 'Colibrís Pareja' },
  { value: 'https://lottie.host/843dc3e9-342c-4e58-94f5-ebdeabe52e61/TZVqV3VA2v.lottie', label: 'Computadora' },
  { value: 'https://lottie.host/f605aec1-2e91-496b-9b55-4982e2f75047/Ow0BUEgWTP.lottie', label: 'Oferta' },
  { value: 'https://lottie.host/60f16af4-8158-4643-8208-d87861d241a9/73zzcGNGgg.lottie', label: 'Anillo' },
  { value: 'https://lottie.host/127d2e9a-3ac9-457f-a3b5-447168c1b4a0/T2ntdUWyuk.lottie', label: 'Collar' },
  { value: 'https://lottie.host/12dd8dcf-4152-449c-b7d0-bb9448664e7a/Tz7RkTie6i.lottie', label: 'Pulsera' },
  { value: 'https://lottie.host/5af05446-f723-40d6-a8cf-85262739629a/BJ4AfBpEnq.lottie', label: 'Tienda' },
  { value: '', label: 'Ninguno' },
];

export default function AdminPanel({ storeData, onRefresh, onLogout }) {
  const [activeTab, setActiveTab] = useState('products');
  const [storeType, setStoreType] = useState('jewelry');
  const [productModal, setProductModal] = useState({ open: false, product: null });
  const [categoryModal, setCategoryModal] = useState({ open: false, category: null });
  const [passwordModal, setPasswordModal] = useState(false);

  const categories = useMemo(() =>
    (storeData?.categories || []).filter(c => c.storeType === storeType).sort((a, b) => a.order - b.order),
    [storeData, storeType]
  );

  const products = useMemo(() => {
    const catIds = categories.map(c => c.id);
    return (storeData?.products || []).filter(p => catIds.includes(p.categoryId));
  }, [storeData, categories]);

  return (
    <div className="admin-panel" style={{ minHeight: '100vh' }}>
      {/* Admin Header */}
      <div
        style={{
          background: COLORS.navy, padding: '16px 20px', position: 'sticky',
          top: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <IconSettings size={20} color={COLORS.orange} />
          <Text style={{ fontFamily: '"Playfair Display", serif', color: 'white', fontWeight: 600, fontSize: '1.05rem' }}>
            Panel Administrador
          </Text>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <ActionIcon variant="subtle" color="white" onClick={() => setPasswordModal(true)}>
            <IconLock size={18} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="white" onClick={onLogout}>
            <IconLogout size={18} />
          </ActionIcon>
        </div>
      </div>

      {/* Store Type Selector */}
      <div style={{ padding: '16px 16px 0' }}>
        <SegmentedControl
          value={storeType}
          onChange={setStoreType}
          fullWidth
          data={[
            { value: 'jewelry', label: 'Joyeria' },
            { value: 'general', label: 'Tienda General' },
          ]}
          styles={{
            root: { background: COLORS.borderLight },
            indicator: { background: COLORS.orange },
            label: { fontFamily: '"Outfit", sans-serif', fontSize: '0.8rem', fontWeight: 500 },
          }}
          radius="xl"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab} style={{ padding: '12px 16px' }}>
        <Tabs.List>
          <Tabs.Tab value="products" leftSection={<IconDiamond size={16} />}>Productos</Tabs.Tab>
          <Tabs.Tab value="categories" leftSection={<IconCategory size={16} />}>Categorias</Tabs.Tab>
        </Tabs.List>

        {/* Products Tab */}
        <Tabs.Panel value="products" pt="md">
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setProductModal({ open: true, product: null })}
            radius="xl"
            style={{ background: COLORS.orange, marginBottom: 16, fontFamily: '"Outfit", sans-serif' }}
          >
            Agregar Producto
          </Button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <AnimatePresence>
              {products.map((product) => (
                <ProductListItem
                  key={product.id}
                  product={product}
                  categories={categories}
                  onEdit={() => setProductModal({ open: true, product })}
                  onDelete={() => {
                    deleteProduct(product.id);
                    onRefresh();
                    notifications.show({ title: 'Eliminado', message: 'Producto eliminado', color: 'red' });
                  }}
                  onToggleSoldOut={() => {
                    toggleSoldOut(product.id);
                    onRefresh();
                  }}
                />
              ))}
            </AnimatePresence>
            {products.length === 0 && (
              <Text ta="center" c="dimmed" py="xl" style={{ fontFamily: '"Outfit", sans-serif' }}>
                No hay productos. Agrega el primero.
              </Text>
            )}
          </div>
        </Tabs.Panel>

        {/* Categories Tab */}
        <Tabs.Panel value="categories" pt="md">
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setCategoryModal({ open: true, category: null })}
            radius="xl"
            style={{ background: COLORS.orange, marginBottom: 16, fontFamily: '"Outfit", sans-serif' }}
          >
            Agregar Categoria
          </Button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {categories.map((cat) => (
              <CategoryListItem
                key={cat.id}
                category={cat}
                productCount={(storeData?.products || []).filter(p => p.categoryId === cat.id).length}
                onEdit={() => setCategoryModal({ open: true, category: cat })}
                onDelete={() => {
                  deleteCategory(cat.id);
                  onRefresh();
                  notifications.show({ title: 'Eliminado', message: 'Categoria eliminada', color: 'red' });
                }}
              />
            ))}
          </div>
        </Tabs.Panel>
      </Tabs>

      {/* Product Modal */}
      <ProductFormModal
        open={productModal.open}
        product={productModal.product}
        categories={categories}
        storeType={storeType}
        onClose={() => setProductModal({ open: false, product: null })}
        onSave={() => { onRefresh(); setProductModal({ open: false, product: null }); }}
      />

      {/* Category Modal */}
      <CategoryFormModal
        open={categoryModal.open}
        category={categoryModal.category}
        storeType={storeType}
        onClose={() => setCategoryModal({ open: false, category: null })}
        onSave={() => { onRefresh(); setCategoryModal({ open: false, category: null }); }}
      />

      {/* Password Modal */}
      <PasswordModal
        open={passwordModal}
        onClose={() => setPasswordModal(false)}
      />
    </div>
  );
}

/* ========= SUB-COMPONENTS ========= */

function ProductListItem({ product, categories, onEdit, onDelete, onToggleSoldOut }) {
  const cat = categories.find(c => c.id === product.categoryId);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
    >
      <Card
        padding="sm"
        radius="md"
        style={{ border: `1px solid ${COLORS.borderLight}`, background: COLORS.white }}
      >
        <div style={{ display: 'flex', gap: 12 }}>
          {/* Thumbnail */}
          <div
            style={{
              width: 60, height: 60, borderRadius: 10, overflow: 'hidden',
              background: COLORS.offWhite, flexShrink: 0,
            }}
          >
            {product.images?.[0] ? (
              <img src={product.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IconPhoto size={20} color={COLORS.borderLight} />
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <Text fw={600} size="sm" style={{ fontFamily: '"Outfit", sans-serif' }} truncate>
              {product.title || 'Sin titulo'}
            </Text>
            <Group gap={6} mt={2}>
              {cat && (
                <Badge size="xs" variant="light" color="blue" style={{ textTransform: 'none' }}>
                  {cat.name}
                </Badge>
              )}
              {product.soldOut && (
                <Badge size="xs" color="red" variant="light">Agotado</Badge>
              )}
            </Group>
            <Text size="xs" c="dimmed" mt={2}>S/. {product.price}</Text>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
            <ActionIcon size="sm" variant="light" color="blue" onClick={onEdit}>
              <IconEdit size={14} />
            </ActionIcon>
            <ActionIcon
              size="sm"
              variant="light"
              color={product.soldOut ? 'green' : 'orange'}
              onClick={onToggleSoldOut}
              title={product.soldOut ? 'Marcar disponible' : 'Marcar agotado'}
            >
              {product.soldOut ? <IconCheck size={14} /> : <IconX size={14} />}
            </ActionIcon>
            <ActionIcon size="sm" variant="light" color="red" onClick={onDelete}>
              <IconTrash size={14} />
            </ActionIcon>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function CategoryListItem({ category, productCount, onEdit, onDelete }) {
  const isDefault = ['ofertas', 'anillos', 'collares', 'collares-parejas', 'pulseras'].includes(category.id);
  return (
    <Card padding="sm" radius="md" style={{ border: `1px solid ${COLORS.borderLight}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 44, height: 44, borderRadius: 10, overflow: 'hidden',
            background: COLORS.navy, flexShrink: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          {category.image ? (
            <img src={category.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : category.lottieUrl ? (
            <dotlottie-wc src={category.lottieUrl} style={{ width: '30px', height: '30px' }} autoplay loop />
          ) : (
            <IconCategory size={20} color="white" />
          )}
        </div>
        <div style={{ flex: 1 }}>
          <Text fw={600} size="sm" style={{ fontFamily: '"Outfit", sans-serif' }}>{category.name}</Text>
          <Text size="xs" c="dimmed">{productCount} productos</Text>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <ActionIcon size="sm" variant="light" color="blue" onClick={onEdit}><IconEdit size={14} /></ActionIcon>
          {!isDefault && (
            <ActionIcon size="sm" variant="light" color="red" onClick={onDelete}><IconTrash size={14} /></ActionIcon>
          )}
        </div>
      </div>
    </Card>
  );
}

function ProductFormModal({ open, product, categories, storeType, onClose, onSave }) {
  const [form, setForm] = useState({
    title: '', description: '', material: '', plating: '', price: '',
    categoryId: '', images: [], soldOut: false,
  });
  const [imageFiles, setImageFiles] = useState([]);

  React.useEffect(() => {
    if (product) {
      setForm({
        title: product.title || '',
        description: product.description || '',
        material: product.material || '',
        plating: product.plating || '',
        price: product.price || '',
        categoryId: product.categoryId || '',
        images: product.images || [],
        soldOut: product.soldOut || false,
      });
    } else {
      setForm({
        title: '', description: '', material: '', plating: '', price: '',
        categoryId: categories[0]?.id || '', images: [], soldOut: false,
      });
    }
    setImageFiles([]);
  }, [product, open, categories]);

  const handleImageAdd = async (files) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.isArray(files) ? files : [files];
    try {
      const newImages = await Promise.all(fileArray.map(f => imageToBase64(f)));
      setForm(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
    } catch (err) {
      notifications.show({ title: 'Error', message: 'Error al cargar imagen', color: 'red' });
    }
  };

  const removeImage = (index) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = () => {
    if (!form.title.trim()) {
      notifications.show({ title: 'Error', message: 'El titulo es obligatorio', color: 'red' });
      return;
    }
    if (!form.categoryId) {
      notifications.show({ title: 'Error', message: 'Selecciona una categoria', color: 'red' });
      return;
    }

    const productData = {
      ...form,
      price: form.price.toString(),
    };

    if (product) {
      updateProduct(product.id, productData);
      notifications.show({ title: 'Actualizado', message: 'Producto actualizado', color: 'green' });
    } else {
      addProduct({ id: generateId(), ...productData });
      notifications.show({ title: 'Agregado', message: 'Producto agregado', color: 'green' });
    }
    onSave();
  };

  const isJewelry = storeType === 'jewelry';

  return (
    <Modal
      opened={open}
      onClose={onClose}
      title={product ? 'Editar Producto' : 'Nuevo Producto'}
      size="lg"
      fullScreen
      radius={0}
      styles={{
        title: { fontFamily: '"Playfair Display", serif', fontWeight: 600, color: COLORS.navy },
        body: { padding: '16px' },
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 80 }}>
        <TextInput
          label="Titulo"
          placeholder="Nombre del producto"
          value={form.title}
          onChange={(e) => setForm(p => ({ ...p, title: e.currentTarget.value }))}
          required
          radius="md"
        />

        <Select
          label="Categoria"
          placeholder="Selecciona categoria"
          value={form.categoryId}
          onChange={(val) => setForm(p => ({ ...p, categoryId: val }))}
          data={categories.map(c => ({ value: c.id, label: c.name }))}
          required
          radius="md"
        />

        <Textarea
          label="Descripcion"
          placeholder="Describe el producto..."
          value={form.description}
          onChange={(e) => setForm(p => ({ ...p, description: e.currentTarget.value }))}
          minRows={3}
          radius="md"
        />

        {isJewelry && (
          <>
            <TextInput
              label="Material"
              placeholder="Ej: Plata 925, Acero inoxidable"
              value={form.material}
              onChange={(e) => setForm(p => ({ ...p, material: e.currentTarget.value }))}
              radius="md"
            />
            <TextInput
              label="Chapado"
              placeholder="Ej: Oro 18k, Rodio"
              value={form.plating}
              onChange={(e) => setForm(p => ({ ...p, plating: e.currentTarget.value }))}
              radius="md"
            />
          </>
        )}

        <TextInput
          label="Precio (S/.)"
          placeholder="0.00"
          value={form.price}
          onChange={(e) => setForm(p => ({ ...p, price: e.currentTarget.value }))}
          radius="md"
        />

        <Switch
          label="Marcar como agotado"
          checked={form.soldOut}
          onChange={(e) => setForm(p => ({ ...p, soldOut: e.currentTarget.checked }))}
          color="orange"
        />

        {/* Images */}
        <div>
          <Text size="sm" fw={500} mb={6}>Imagenes (1200x1200 recomendado)</Text>

          {form.images.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {form.images.map((img, i) => (
                <div key={i} style={{ position: 'relative', width: 80, height: 80 }}>
                  <img
                    src={img}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                  />
                  <ActionIcon
                    size="xs"
                    variant="filled"
                    color="red"
                    radius="xl"
                    style={{ position: 'absolute', top: -6, right: -6 }}
                    onClick={() => removeImage(i)}
                  >
                    <IconX size={10} />
                  </ActionIcon>
                </div>
              ))}
            </div>
          )}

          <FileInput
            accept="image/*"
            placeholder="Seleccionar imagen"
            leftSection={<IconUpload size={16} />}
            onChange={(file) => handleImageAdd(file)}
            radius="md"
            clearable
          />
          <Text size="xs" c="dimmed" mt={4}>
            Puedes agregar varias imagenes una por una
          </Text>
        </div>

        <Button
          onClick={handleSubmit}
          radius="xl"
          size="md"
          mt="md"
          style={{ background: COLORS.navy, fontFamily: '"Outfit", sans-serif' }}
        >
          {product ? 'Guardar Cambios' : 'Agregar Producto'}
        </Button>
      </div>
    </Modal>
  );
}

function CategoryFormModal({ open, category, storeType, onClose, onSave }) {
  const [form, setForm] = useState({ name: '', lottieUrl: '', image: '' });

  React.useEffect(() => {
    if (category) {
      setForm({
        name: category.name || '',
        lottieUrl: category.lottieUrl || '',
        image: category.image || '',
      });
    } else {
      setForm({ name: '', lottieUrl: '', image: '' });
    }
  }, [category, open]);

  const handleImageAdd = async (file) => {
    if (!file) return;
    try {
      const base64 = await imageToBase64(file);
      setForm(p => ({ ...p, image: base64 }));
    } catch {
      notifications.show({ title: 'Error', message: 'Error al cargar imagen', color: 'red' });
    }
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      notifications.show({ title: 'Error', message: 'El nombre es obligatorio', color: 'red' });
      return;
    }

    if (category) {
      updateCategory(category.id, form);
      notifications.show({ title: 'Actualizado', message: 'Categoria actualizada', color: 'green' });
    } else {
      const data = loadStore();
      const maxOrder = Math.max(0, ...data.categories.filter(c => c.storeType === storeType).map(c => c.order));
      addCategory({
        id: generateId(),
        ...form,
        storeType,
        order: maxOrder + 1,
      });
      notifications.show({ title: 'Agregada', message: 'Categoria agregada', color: 'green' });
    }
    onSave();
  };

  return (
    <Modal
      opened={open}
      onClose={onClose}
      title={category ? 'Editar Categoria' : 'Nueva Categoria'}
      centered
      radius="lg"
      styles={{
        title: { fontFamily: '"Playfair Display", serif', fontWeight: 600, color: COLORS.navy },
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <TextInput
          label="Nombre de la Categoria"
          placeholder="Ej: Aretes"
          value={form.name}
          onChange={(e) => setForm(p => ({ ...p, name: e.currentTarget.value }))}
          required
          radius="md"
        />

        <Select
          label="Animacion Lottie"
          placeholder="Seleccionar animacion"
          value={form.lottieUrl}
          onChange={(val) => setForm(p => ({ ...p, lottieUrl: val || '' }))}
          data={LOTTIE_OPTIONS}
          clearable
          radius="md"
        />

        {form.lottieUrl && (
          <div style={{ textAlign: 'center' }}>
            <dotlottie-wc src={form.lottieUrl} style={{ width: '60px', height: '60px', margin: '0 auto' }} autoplay loop />
          </div>
        )}

        <div>
          <Text size="sm" fw={500} mb={6}>Imagen de Categoria</Text>
          {form.image && (
            <div style={{ position: 'relative', width: 100, height: 100, marginBottom: 8 }}>
              <img src={form.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
              <ActionIcon
                size="xs" variant="filled" color="red" radius="xl"
                style={{ position: 'absolute', top: -6, right: -6 }}
                onClick={() => setForm(p => ({ ...p, image: '' }))}
              >
                <IconX size={10} />
              </ActionIcon>
            </div>
          )}
          <FileInput
            accept="image/*"
            placeholder="Seleccionar imagen"
            leftSection={<IconUpload size={16} />}
            onChange={handleImageAdd}
            radius="md"
            clearable
          />
        </div>

        <Button
          onClick={handleSubmit}
          radius="xl"
          mt="md"
          style={{ background: COLORS.navy, fontFamily: '"Outfit", sans-serif' }}
        >
          {category ? 'Guardar Cambios' : 'Agregar Categoria'}
        </Button>
      </div>
    </Modal>
  );
}

function PasswordModal({ open, onClose }) {
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSave = () => {
    if (newPw.length < 4) {
      notifications.show({ title: 'Error', message: 'La contrasena debe tener al menos 4 caracteres', color: 'red' });
      return;
    }
    if (newPw !== confirm) {
      notifications.show({ title: 'Error', message: 'Las contrasenas no coinciden', color: 'red' });
      return;
    }
    changePassword(newPw);
    notifications.show({ title: 'Listo', message: 'Contrasena cambiada', color: 'green' });
    setNewPw('');
    setConfirm('');
    onClose();
  };

  return (
    <Modal opened={open} onClose={onClose} title="Cambiar Contrasena" centered radius="lg"
      styles={{ title: { fontFamily: '"Playfair Display", serif', fontWeight: 600 } }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <TextInput
          type="password" label="Nueva Contrasena" value={newPw}
          onChange={(e) => setNewPw(e.currentTarget.value)} radius="md"
        />
        <TextInput
          type="password" label="Confirmar Contrasena" value={confirm}
          onChange={(e) => setConfirm(e.currentTarget.value)} radius="md"
        />
        <Button onClick={handleSave} radius="xl" style={{ background: COLORS.navy }}>
          Guardar
        </Button>
      </div>
    </Modal>
  );
}
