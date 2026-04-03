import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Colors } from '../constants/Colors';
import { Fonts } from '../constants/Fonts';

const DeleteAccountModal = ({ visible, onClose, onConfirm }) => {
    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Ícone de Perigo enviado nas imagens */}
                    <Image
                        source={require('../assets/images/Propriedade 1=perigo.png')}
                        style={styles.icon}
                    />

                    <Text style={styles.title}>Deseja mesmo apagar sua conta?</Text>
                    <Text style={styles.subtitle}>Esta ação é irreversível.</Text>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelText}>Cancelar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
                            <Text style={styles.confirmText}>Apagar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        // Estilos exatos solicitados
        width: 330,
        height: 200,
        paddingVertical: 16,
        paddingHorizontal: 24,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        borderRadius: 12,
        backgroundColor: '#FFF6E9', // var(--branco)

        // Box Shadow solicitado (Simulado para Mobile)
        shadowColor: 'rgba(79, 44, 29, 0.24)',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 12,
        elevation: 8,
    },
    icon: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
    },
    title: {
        fontFamily: Fonts.newsreader || 'System',
        fontSize: 16,
        color: '#4F2C1D',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    subtitle: {
        fontFamily: Fonts.poppins || 'System',
        fontSize: 14,
        color: '#4F2C1D',
        opacity: 0.7,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 20,
        marginTop: 10,
    },
    cancelButton: {
        padding: 10,
    },
    cancelText: {
        fontFamily: Fonts.poppins || 'System',
        color: '#4F2C1D',
    },
    confirmButton: {
        backgroundColor: '#E74C3C',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    confirmText: {
        color: '#FFF',
        fontWeight: 'bold',
    }
});

export default DeleteAccountModal;